const GAME_SETTINGS = {
    physics: {
        gravityForce: 0.5
    },
    combat: {
        hitDamage: 1,
        invincibleTicks: 60
    },
    character: {
        width: 150,
        height: 150,
        maxHealth: 3,
        speed: 3,
        airSpeedFactor: 1.25,
        jumpSpeed: 11.5,
        crouchTicks: 6,
        landTicks: 9,
        apexSpeed: 3,
        restDelayTicks: 600,
        restFrameTicks: 15,
        idleFps: 5,
        walkFps: 8,
        leftWallX: -60,
        rightWallOffset: 60
    },
    enemy: {
        width: 80,
        height: 80,
        maxHealth: 2,
        speed: 0.5,
        animationFps: 8
    },
    debug: {
        showHitboxes: true
    }
};