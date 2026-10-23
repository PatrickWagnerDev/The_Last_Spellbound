const MUTE_STORAGE_KEY = 'spellbound-muted';
const MUSIC_VOLUME = 0.5;
const SOUND_PATHS = {
    menuMusic: './assets/sounds/628385__davo32__metal-forest.mp3'
};

class SoundManager {
    constructor(){
        this.isMuted = this.readMuteState();
        this.music = null;
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
        if(this.music){
            this.music.muted = this.isMuted;
        }
    }

    playMusic(soundName){
        this.stopMusic();
        this.music = new Audio(SOUND_PATHS[soundName]);
        this.music.loop = true;
        this.music.volume = MUSIC_VOLUME;
        this.music.muted = this.isMuted;
        this.music.play().catch(() => {});
    }

    stopMusic(){
        this.music?.pause();
        this.music = null;
    }
}
