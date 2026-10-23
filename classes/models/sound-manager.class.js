const MUTE_STORAGE_KEY = 'spellbound-muted';

class SoundManager {
    constructor(){
        this.isMuted = this.readMuteState();
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
    }
}
