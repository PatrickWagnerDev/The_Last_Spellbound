const MAGE_BOSS_SPRITES = {
    idle: { path: './assets/image/04-bosses/1 Mage/Mage_boss_walk.png', frames: 6 },
    walk: { path: './assets/image/04-bosses/1 Mage/Mage_boss_run.png', frames: 6 },
    hurt: { path: './assets/image/04-bosses/1 Mage/Mage_boss_hurt.png', frames: 4 },
    death: { path: './assets/image/04-bosses/1 Mage/Mage_boss_death.png', frames: 6 }
};

class MageBoss extends Enemy {
    constructor(column, row){
        super(column, row, {
            settings: GAME_SETTINGS.mageBoss,
            sprites: MAGE_BOSS_SPRITES,
            frameSize: 64,
            hitbox: { offsetX: 42, offsetY: 15, width: 120, height: 174 },
            spriteFacesLeft: true
        });
        this.startAnimation();
    }

    updateBehavior(){
        this.faceCharacter();
        this.showLoopState('idle', this.settings.animationFps);
    }

    faceCharacter(){
        this.otherDirection = getRectCenterX(this.world.character.getHitbox()) < getRectCenterX(this.getHitbox());
    }
}
