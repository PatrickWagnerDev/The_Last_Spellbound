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
        deathTicks: 60,
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
        coyoteTicks: 6,
        apexSpeed: 3,
        restDelayTicks: 600,
        restTicks: 60,
        idleFps: 5,
        walkCycleTicks: 45,
        edgeTolerance: 12,
        leftWallX: -60,
        rightWallOffset: 60
    },
    bear: {
        width: 80,
        height: 80,
        maxHealth: 2,
        speed: 0.5,
        animationFps: 8,
        hurtTicks: 24,
        knockbackSpeed: 4,
        deathTicks: 60
    },
    mageBoss: {
        width: 192,
        height: 192,
        maxHealth: 15,
        speed: 0.5,
        animationFps: 8,
        hurtTicks: 24,
        knockbackSpeed: 1,
        deathTicks: 90,
        sightTiles: 7,
        sightAboveTiles: 2,
        loseSightTicks: 60,
        sneerTicks: 60,
        searchTicks: 60,
        lookSwitchTicks: 20,
        attackTicks: 45,
        fireballReleaseTick: 28,
        fireballCooldownTicks: 300,
        fireballDamage: 1,
        fireballScale: 3,
        fireballLowHeight: 48,
        fireballMaxHeight: 99,
        rayCooldownTicks: 900,
        rayWindupTicks: 60,
        rayTicks: 90,
        rayDamage: 2,
        raySpeedFactor: 2,
        rayScale: 3,
        rayMaxHeight: 48
    },
    fireball: {
        damage: 3,
        speed: 6,
        range: 420,
        flightFps: 12,
        impactTicks: 30
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
        openFps: 8,
        openSoundFrame: 5,
        portalOffset: 2
    },
    portal: {
        size: 96,
        animationFps: 8,
        appearTicks: 30
    },
    transition: {
        expandTicks: 36,
        contractTicks: 36,
        spinFps: 12
    },
    energy: {
        maxCharges: 5,
        startCharges: 1
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
        blinkIntervalTicks: 6,
        bossBarScale: 1,
        bossBarGap: 0,
        bossBarMargin: 12,
        bossBarHealthPerBar: 3,
        pauseOverlayAlpha: 0.5
    },
    debug: {
        unlockAllLevels: false,
        startInBossLevel: false,
        showHitboxes: false
    }
};