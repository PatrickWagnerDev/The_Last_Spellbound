const MUTE_STORAGE_KEY = 'spellbound-muted';
const SOUND_VOLUMES = {
    menuClick: 0.3,
    menuHover: 0.5,
    pauseOpen: 0.3,
    pauseClose: 0.3,
    gameOver: 0.5,
    victory: 0.5,
    jump: 0.4,
    land: 0.4
};
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
    menuHover: './assets/sounds/251390__deadsillyrabbit__button_hover-mp3.mp3',
    pauseOpen: './assets/sounds/873101__heyheytheree__pause-rpg-psx-ui-sfx-free.mp3',
    pauseClose: './assets/sounds/873112__heyheytheree__unpause-rpg-psx-ui-sfx-free.mp3',
    gameOver: './assets/sounds/409343__luminousfridge__player-death.mp3',
    victory: './assets/sounds/856038__yokomatsuko__electronic-victory-sound.mp3',
    jump: './assets/sounds/662463__fullstacksound__jump_player.mp3',
    land: './assets/sounds/540272__zepurple__land-a-jump.mp3'
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
        SOUND.volume = SOUND_VOLUMES[soundName];
        SOUND.play().catch(() => {});
    }

    stopMusic(){
        this.music?.pause();
        this.music = null;
    }
}
