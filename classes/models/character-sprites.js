const CHARACTER_SPRITES = {
    fireWizard: {
        idle: { path: './assets/image/01-wizard/Fire Wizard/Idle.png', frames: 7 },
        walk: { path: './assets/image/01-wizard/Fire Wizard/Walk.png', frames: 6 },
        jump: { path: './assets/image/01-wizard/Fire Wizard/Jump.png', frames: 9 },
        rest: { path: './assets/image/02-wizard-extras/Fire Wizard/Rest.png', frames: 4 },
        hurt: { path: './assets/image/01-wizard/Fire Wizard/Hurt.png', frames: 3 },
        dead: { path: './assets/image/01-wizard/Fire Wizard/Dead.png', frames: 6 },
        roll: { path: './assets/image/02-wizard-extras/Fire Wizard/Roll.png', frames: 6 },
        attack: { path: './assets/image/02-wizard-extras/Fire Wizard/Attack_1.png', frames: 5 },
        cast: { path: './assets/image/01-wizard/Fire Wizard/Fireball.png', frames: 8 },
        projectile: { path: './assets/image/01-wizard/Fire Wizard/Charge.png', frames: 12 }
    },
    lightningMage: {
        idle: { path: './assets/image/01-wizard/Lightning Mage/Idle.png', frames: 7 },
        walk: { path: './assets/image/01-wizard/Lightning Mage/Walk.png', frames: 7 },
        jump: { path: './assets/image/01-wizard/Lightning Mage/Jump.png', frames: 8 },
        rest: { path: './assets/image/02-wizard-extras/Lightning Mage/Rest.png', frames: 6 },
        hurt: { path: './assets/image/01-wizard/Lightning Mage/Hurt.png', frames: 3 },
        dead: { path: './assets/image/01-wizard/Lightning Mage/Dead.png', frames: 5 },
        roll: { path: './assets/image/02-wizard-extras/Lightning Mage/Roll.png', frames: 7 },
        attack: { path: './assets/image/01-wizard/Lightning Mage/Attack_1.png', frames: 10 },
        cast: { path: './assets/image/01-wizard/Lightning Mage/Light_ball.png', frames: 7 },
        projectile: { path: './assets/image/01-wizard/Lightning Mage/Charge.png', frames: 10 }
    }
};

const CHARACTER_TRAITS = {
    fireWizard: {
        label: 'Fire Wizard',
        flightFrames: 5,
        jumpFrames: { crouch: [0, 1, 2], up: 3, apex: 4, down: 5, land: [6, 7, 8] },
        projectileOffsetX: 0,
        selectEffect: { prefix: './assets/image/08-magic-effects/PNG/Explosion/Explosion', suffix: '.png', frames: 9, bounds: { x: 53, y: 60, width: 155, height: 136 } }
    },
    lightningMage: {
        label: 'Lightning Mage',
        flightFrames: 5,
        jumpFrames: { crouch: [0, 1, 2], up: 3, apex: 4, down: 6, land: [6, 7, 7] },
        projectileOffsetX: 26,
        selectEffect: { prefix: './assets/image/08-magic-effects/PNG/Lightning2/Lightning2_', suffix: '.png', frames: 10, bounds: { x: 86, y: 53, width: 90, height: 133 } }
    }
};
