const SOUND_VOLUMES = {
    menuClick: 0.3,
    menuHover: 0.5,
    pauseOpen: 0.3,
    pauseClose: 0.3,
    gameOver: 0.5,
    victory: 0.5,
    jump: 0.4,
    land: 0.4,
    roll: 0.4,
    attack: 0.4,
    cast: 0.4,
    fireballImpact: 0.4,
    castImpact: 0.4,
    noEnergy: 0.3,
    walk: 0.5,
    hurt: 0.4,
    collect: 0.2,
    snore: 0.3,
    chestOpen: 0.3,
    portalEnter: 0.4,
    portalExit: 0.4,
    enemyHit: 0.4,
    bearDeath: 0.4,
    bossDeath: 0.2,
    bossFireball: 0.4,
    bossRay: 0.3
};
const LOOP_RATES = {
    walk: 1.1
};
const MUSIC_VOLUMES = {
    menuMusic: 0.1,
    forestMusic: 0.3,
    bossMusic: 0.1,
    demonMusic: 0.1,
    levelTwoMusic: 0.3,
    levelThreeMusic: 0.3,
    knightMusic: 0.1
};
const MUSIC_PATHS = {
    menuMusic: './assets/sounds/628385__davo32__metal-forest.mp3',
    forestMusic: './assets/sounds/785711__16pixel__fantasy-forest.mp3',
    bossMusic: './assets/sounds/443128__sirkoto51__boss-battle-loop-3.mp3',
    demonMusic: './assets/sounds/683457__seth_makes_sounds__dope-video-game-boss-music.mp3',
    levelTwoMusic: './assets/sounds/727920__ehved__forest-theme-orchestral-loop.mp3',
    levelThreeMusic: './assets/sounds/807111__cvltiv8r__somber-piano-chord-progression-d-76bpm.mp3',
    knightMusic: './assets/sounds/530064__foolboymedia__super-mega-ultimate-final-boss-battle.mp3'
};
const SOUND_PATHS = {
    menuClick: './assets/sounds/873105__heyheytheree__tab-rpg-psx-ui-sfx-free.mp3',
    menuHover: './assets/sounds/251390__deadsillyrabbit__button_hover-mp3.mp3',
    pauseOpen: './assets/sounds/873101__heyheytheree__pause-rpg-psx-ui-sfx-free.mp3',
    pauseClose: './assets/sounds/873112__heyheytheree__unpause-rpg-psx-ui-sfx-free.mp3',
    gameOver: './assets/sounds/409343__luminousfridge__player-death.mp3',
    victory: './assets/sounds/856038__yokomatsuko__electronic-victory-sound.mp3',
    jump: './assets/sounds/662463__fullstacksound__jump_player.mp3',
    land: './assets/sounds/540272__zepurple__land-a-jump.mp3',
    roll: './assets/sounds/529563__drmrsir__roll.mp3',
    attack: './assets/sounds/840716__nomagician__sword-swing-1.mp3',
    cast: './assets/sounds/334237__liamg_sfx__fireball-cast-3.mp3',
    fireballImpact: './assets/sounds/431174__blankened__fireball-explosion.mp3',
    castImpact: './assets/sounds/431174__blankened__fireball-explosion.mp3',
    noEnergy: './assets/sounds/407466__loyalty_freak_music__buzzer.mp3',
    walk: './assets/sounds/417291__benzix2__steps.mp3',
    hurt: './assets/sounds/662465__fullstacksound__hurt_player.mp3',
    collect: './assets/sounds/711129__xiko__retro-collection-3.mp3',
    snore: './assets/sounds/760036__stevielematt__snore-03_44100.mp3',
    chestOpen: './assets/sounds/519630__mrthenoronha__open-treasure-chest-8-bit.mp3',
    portalEnter: './assets/sounds/697634__bigdino1995__portal.mp3',
    portalExit: './assets/sounds/697634__bigdino1995__portal-reverse.mp3',
    enemyHit: './assets/sounds/273563__n_audioman__hit_hurt7.mp3',
    bearDeath: './assets/sounds/704635__zulfish__monster-dying.mp3',
    bossDeath: './assets/sounds/500272__bigspider95__enimey_dead.mp3',
    bossFireball: './assets/sounds/714744__fall-e__interface-magic-fireball-bell-spell.mp3',
    bossRay: './assets/sounds/169679__beman87__laser-shotgun-loading.mp3'
};

const CHARACTER_SOUNDS = {
    fireWizard: {},
    lightningMage: {
        cast: { path: './assets/sounds/649360__sonofxaudio__sword_thunder01.mp3', volume: 0.5 },
        castImpact: { path: './assets/sounds/553153__eminyildirim__firework-single-explosion.mp3', volume: 0.5 },
        attack: { path: './assets/sounds/49667__ejfortin__dual-energy-daggers-5.mp3', volume: 0.08 }
    }
};
