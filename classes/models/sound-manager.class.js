const MUTE_STORAGE_KEY = 'spellbound-muted';
const AUDIO_WAIT_MS = 10000;

class SoundManager {
    constructor(){
        this.isMuted = this.readMuteState();
        this.music = null;
        this.loops = {};
        this.musicCache = {};
        this.characterSounds = {};
        this.characterVolumes = {};
        this.sounds = this.loadSounds();
    }

    loadSounds(){
        const SOUNDS = {};
        Object.entries(SOUND_PATHS).forEach(([soundName, soundPath]) => SOUNDS[soundName] = new Audio(soundPath));
        return SOUNDS;
    }

    setCharacter(characterId){
        this.characterSounds = {};
        this.characterVolumes = {};
        Object.entries(CHARACTER_SOUNDS[characterId]).forEach(([soundName, sound]) => this.addCharacterSound(soundName, sound));
    }

    addCharacterSound(soundName, sound){
        this.characterSounds[soundName] = new Audio(sound.path);
        this.characterVolumes[soundName] = sound.volume ?? SOUND_VOLUMES[soundName];
    }

    getSound(soundName){
        return this.characterSounds[soundName] ?? this.sounds[soundName];
    }

    getVolume(soundName){
        return this.characterVolumes[soundName] ?? SOUND_VOLUMES[soundName];
    }

    readMuteState(){
        try {
            return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    }

    saveMuteState(){
        try {
            localStorage.setItem(MUTE_STORAGE_KEY, this.isMuted);
        } catch {
            return;
        }
    }

    toggleMute(){
        this.isMuted = !this.isMuted;
        this.saveMuteState();
        this.applyMute();
    }

    applyMute(){
        const PLAYERS = [this.music, ...Object.values(this.loops)];
        PLAYERS.filter(Boolean).forEach(player => player.muted = this.isMuted);
    }

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

    preloadAudio(musicNames){
        musicNames.filter(soundName => !this.musicCache[soundName]).forEach(soundName => {
            this.musicCache[soundName] = new Audio(MUSIC_PATHS[soundName]);
        });
        const SOUND_LIST = [...Object.values(this.sounds), ...Object.values(this.characterSounds)];
        const MUSIC_LIST = musicNames.map(soundName => this.musicCache[soundName]);
        return Promise.all([...SOUND_LIST, ...MUSIC_LIST].map(audio => this.waitForAudio(audio)));
    }

    playMusic(soundName){
        this.stopMusic();
        this.music = this.musicCache[soundName] ?? new Audio(MUSIC_PATHS[soundName]);
        this.music.currentTime = 0;
        this.music.loop = true;
        this.music.volume = MUSIC_VOLUMES[soundName];
        this.music.muted = this.isMuted;
        this.music.play().catch(() => this.retryMusicOnInput(this.music));
    }

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

    stopLoop(soundName){
        this.loops[soundName]?.pause();
        delete this.loops[soundName];
    }

    stopMusic(){
        this.music?.pause();
        this.music = null;
    }
}
