const MUTE_STORAGE_KEY = 'spellbound-muted';
const EFFECT_VOLUME = 0.5;
const MUSIC_VOLUMES = {
    menuMusic: 0.1,
    forestMusic: 0.3
};
const MUSIC_PATHS = {
    menuMusic: './assets/sounds/628385__davo32__metal-forest.mp3',
    forestMusic: './assets/sounds/785711__16pixel__fantasy-forest.mp3'
};
const SOUND_PATHS = {
    menuClick: './assets/sounds/873105__heyheytheree__tab-rpg-psx-ui-sfx-free.mp3',
    menuHover: './assets/sounds/251390__deadsillyrabbit__button_hover-mp3.mp3'
};

class SoundManager {
    constructor(){
        this.isMuted = this.readMuteState();
        this.music = null;
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
        if(this.music){
            this.music.muted = this.isMuted;
        }
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
        const SOUND = this.sounds[soundName].cloneNode();
        SOUND.volume = EFFECT_VOLUME;
        SOUND.play().catch(() => {});
    }

    stopMusic(){
        this.music?.pause();
        this.music = null;
    }
}
