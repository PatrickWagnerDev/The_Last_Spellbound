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
        hurtTicks: 24,
        knockbackSpeed: 5,
        deadFrameTicks: 10,
        rollTicks: 36,
        rollSpeed: 5,
        rollCooldownTicks: 30,
        attackTicks: 30,
        attackHitStartTick: 12,
        attackHitEndTick: 18,
        castTicks: 40,
        castReleaseTick: 25,
        castCooldownTicks: 60,
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
        animationFps: 8,
        hurtTicks: 24,
        knockbackSpeed: 4,
        deathTicks: 60
    },
    fireball: {
        damage: 3,
        speed: 6,
        range: 420,
        flightFps: 12,
        impactFps: 14
    },
    item: {
        pickupFps: 14
    },
    key: {
        scale: 2,
        animationFps: 10
    },
    pizza: {
        scale: 2,
        healAmount: 1
    },
    donut: {
        scale: 2
    },
    chest: {
        scale: 2,
        openDistance: 48,
        openFps: 8
    },
    energy: {
        maxCharges: 5,
        startCharges: 5
    },
    ui: {
        statusBarScale: 2,
        statusBarX: 12,
        statusBarY: 12,
        energyBarY: 44,
        keyIconY: 76,
        keyIconSpacing: 36,
        keyIconScale: 2,
        blinkTicks: 60,
        blinkIntervalTicks: 6
    },
    debug: {
        showHitboxes: true
    }
};