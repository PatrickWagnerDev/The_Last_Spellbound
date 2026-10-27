const MUTE_STORAGE_KEY = 'spellbound-muted';
const AUDIO_WAIT_MS = 10000;

/**
 * The one place for all sounds of the game: short sound effects, the looping music, looping sounds such as
 * steps, and sounds that differ by character. It also remembers whether the sound is muted.
 */
class SoundManager {
    /**
     * Creates the sound manager: reads the saved mute setting, prepares the storages and loads the sound effects.
     */
    constructor(){
        this.isMuted = this.readMuteState();
        this.music = null;
        this.loops = {};
        this.musicCache = {};
        this.characterSounds = {};
        this.characterVolumes = {};
        this.sounds = this.loadSounds();
    }

    /**
     * Creates an audio object for every sound effect of the sound settings, which starts loading them.
     * @returns {Object<string, HTMLAudioElement>} The audio objects by the name of the sound.
     */
    loadSounds(){
        const SOUNDS = {};
        Object.entries(SOUND_PATHS).forEach(([soundName, soundPath]) => SOUNDS[soundName] = new Audio(soundPath));
        return SOUNDS;
    }

    /**
     * Sets the sounds that belong to the chosen character, replacing those of the one before.
     * @param {string} characterId - 'fireWizard' or 'lightningMage'.
     * @returns {void}
     */
    setCharacter(characterId){
        this.characterSounds = {};
        this.characterVolumes = {};
        Object.entries(CHARACTER_SOUNDS[characterId]).forEach(([soundName, sound]) => this.addCharacterSound(soundName, sound));
    }

    /**
     * Adds one sound of a character with its own volume, or the standard volume of that sound.
     * @param {string} soundName - Name of the sound it replaces.
     * @param {{path: string, volume?: number}} sound - Path and optional volume of the sound.
     * @returns {void}
     */
    addCharacterSound(soundName, sound){
        this.characterSounds[soundName] = new Audio(sound.path);
        this.characterVolumes[soundName] = sound.volume ?? SOUND_VOLUMES[soundName];
    }

    /**
     * Returns the audio object of a sound: the one of the character if it has its own, otherwise the normal one.
     * @param {string} soundName - Name of the sound.
     * @returns {HTMLAudioElement} The audio object.
     */
    getSound(soundName){
        return this.characterSounds[soundName] ?? this.sounds[soundName];
    }

    /**
     * Returns the volume of a sound: the one of the character sound if there is one, otherwise the standard one.
     * @param {string} soundName - Name of the sound.
     * @returns {number} The volume from 0 to 1.
     */
    getVolume(soundName){
        return this.characterVolumes[soundName] ?? SOUND_VOLUMES[soundName];
    }

    /**
     * Reads from the local storage whether the sound was muted. Without storage the sound is on.
     * @returns {boolean} True if the sound is muted.
     */
    readMuteState(){
        try {
            return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    }

    /**
     * Saves the mute setting in the local storage. A blocked storage is ignored.
     * @returns {void}
     */
    saveMuteState(){
        try {
            localStorage.setItem(MUTE_STORAGE_KEY, this.isMuted);
        } catch {
            return;
        }
    }

    /**
     * Switches the sound between muted and on, saves the setting and applies it to the running sounds.
     * @returns {void}
     */
    toggleMute(){
        this.isMuted = !this.isMuted;
        this.saveMuteState();
        this.applyMute();
    }

    /**
     * Applies the mute setting to the running music and the running looping sounds.
     * @returns {void}
     */
    applyMute(){
        const PLAYERS = [this.music, ...Object.values(this.loops)];
        PLAYERS.filter(Boolean).forEach(player => player.muted = this.isMuted);
    }

    /**
     * Waits until an audio file can be played through, fails to load, or the waiting time of the sound manager
     * is over, so that a browser that does not preload sound cannot block the loading screen.
     * @param {HTMLAudioElement} audio - The audio object to wait for.
     * @returns {Promise<void>} Resolves when the file is ready or the waiting time is over.
     */
    waitForAudio(audio){
        return new Promise(resolve => {
            if(audio.readyState >= 4){
                resolve();
                return;
            }
            ['canplaythrough', 'error'].forEach(eventName => audio.addEventListener(eventName, resolve, { once: true }));
            setTimeout(resolve, AUDIO_WAIT_MS);
        });
    }

    /**
     * Preloads all sound effects, the sounds of the character and the given music, and keeps the music in a
     * storage for playMusic.
     * @param {string[]} musicNames - Names of the music pieces the level needs.
     * @returns {Promise<void[]>} Resolves when everything is ready or the waiting time is over.
     */
    preloadAudio(musicNames){
        musicNames.filter(soundName => !this.musicCache[soundName]).forEach(soundName => {
            this.musicCache[soundName] = new Audio(MUSIC_PATHS[soundName]);
        });
        const SOUND_LIST = [...Object.values(this.sounds), ...Object.values(this.characterSounds)];
        const MUSIC_LIST = musicNames.map(soundName => this.musicCache[soundName]);
        return Promise.all([...SOUND_LIST, ...MUSIC_LIST].map(audio => this.waitForAudio(audio)));
    }

    /**
     * Plays a music piece in a loop from the start, replacing the music before. If the browser blocks it, it is
     * started at the next click or key press.
     * @param {string} soundName - Name of the music piece in the sound settings.
     * @returns {void}
     */
    playMusic(soundName){
        this.stopMusic();
        this.music = this.musicCache[soundName] ?? new Audio(MUSIC_PATHS[soundName]);
        this.music.currentTime = 0;
        this.music.loop = true;
        this.music.volume = MUSIC_VOLUMES[soundName];
        this.music.muted = this.isMuted;
        this.music.play().catch(() => this.retryMusicOnInput(this.music));
    }

    /**
     * Waits for the next click or key press and then starts the music, if it is still the current music.
     * @param {HTMLAudioElement} music - The music that the browser did not start.
     * @returns {void}
     */
    retryMusicOnInput(music){
        const RETRY_MUSIC = () => {
            window.removeEventListener('click', RETRY_MUSIC);
            window.removeEventListener('keydown', RETRY_MUSIC);
            if(this.music === music){
                music.play().catch(() => {});
            }
        };
        window.addEventListener('click', RETRY_MUSIC);
        window.addEventListener('keydown', RETRY_MUSIC);
    }

    /**
     * Plays a sound effect once, unless the sound is muted. The effect is cloned so that it can play several
     * times at once.
     * @param {string} soundName - Name of the sound effect.
     * @param {number} [playbackRate] - Playback speed, 1 is normal.
     * @param {boolean} [preservesPitch] - False lets a different speed also change the pitch.
     * @returns {void}
     */
    playSound(soundName, playbackRate = 1, preservesPitch = true){
        if(this.isMuted){
            return;
        }
        const SOUND_CLONE = this.getSound(soundName).cloneNode();
        SOUND_CLONE.volume = this.getVolume(soundName);
        SOUND_CLONE.preservesPitch = preservesPitch;
        SOUND_CLONE.playbackRate = playbackRate;
        SOUND_CLONE.play().catch(() => {});
    }

    /**
     * Starts a looping sound such as the steps, unless it is already running.
     * @param {string} soundName - Name of the sound effect.
     * @returns {void}
     */
    startLoop(soundName){
        if(this.loops[soundName]){
            return;
        }
        const LOOP_CLONE = this.getSound(soundName).cloneNode();
        LOOP_CLONE.loop = true;
        LOOP_CLONE.volume = this.getVolume(soundName);
        LOOP_CLONE.playbackRate = LOOP_RATES[soundName] ?? 1;
        LOOP_CLONE.muted = this.isMuted;
        LOOP_CLONE.play().catch(() => {});
        this.loops[soundName] = LOOP_CLONE;
    }

    /**
     * Stops a looping sound and forgets it.
     * @param {string} soundName - Name of the sound effect.
     * @returns {void}
     */
    stopLoop(soundName){
        this.loops[soundName]?.pause();
        delete this.loops[soundName];
    }

    /**
     * Stops the running music.
     * @returns {void}
     */
    stopMusic(){
        this.music?.pause();
        this.music = null;
    }
}
