const MUTE_STORAGE_KEY = 'spellbound-muted';
const MUSIC_VOLUME = 0.5;
const UNLOCK_EVENTS = ['pointerdown', 'keydown'];
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
        this.startMusic(this.music);
    }

    startMusic(music){
        music.play().catch(() => this.startMusicOnInput(music));
    }

    startMusicOnInput(music){
        const START_ON_INPUT = () => {
            UNLOCK_EVENTS.forEach(eventName => window.removeEventListener(eventName, START_ON_INPUT));
            if(this.music === music){
                music.play().catch(() => {});
            }
        };
        UNLOCK_EVENTS.forEach(eventName => window.addEventListener(eventName, START_ON_INPUT));
    }

    stopMusic(){
        this.music?.pause();
        this.music = null;
    }
}
