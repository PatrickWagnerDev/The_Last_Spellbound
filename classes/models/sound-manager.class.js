const MUTE_STORAGE_KEY = 'spellbound-muted';

class SoundManager {
    constructor(){
        this.isMuted = this.readMuteState();
        this.music = null;
        this.loops = {};
        this.sounds = this.loadSounds();
    }

    loadSounds(){
        const SOUNDS = {};
        Object.entries(SOUND_PATHS).forEach(([soundName, soundPath]) => SOUNDS[soundName] = new Audio(soundPath));
        return SOUNDS;
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

    playMusic(soundName){
        this.stopMusic();
        this.music = new Audio(MUSIC_PATHS[soundName]);
        this.music.loop = true;
        this.music.volume = MUSIC_VOLUMES[soundName];
        this.music.muted = this.isMuted;
        this.music.play().catch(() => {});
    }

    playSound(soundName){
        if(this.isMuted){
            return;
        }
        const SOUND_CLONE = this.sounds[soundName].cloneNode();
        SOUND_CLONE.volume = SOUND_VOLUMES[soundName];
        SOUND_CLONE.play().catch(() => {});
    }

    startLoop(soundName){
        if(this.loops[soundName]){
            return;
        }
        const LOOP_CLONE = this.sounds[soundName].cloneNode();
        LOOP_CLONE.loop = true;
        LOOP_CLONE.volume = SOUND_VOLUMES[soundName];
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
