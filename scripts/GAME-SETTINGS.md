# Game Settings

All tunable values live in `scripts/game-settings.js` in the object `GAME_SETTINGS`.
The game runs at 60 ticks per second, all speeds are given per tick.

## physics

| Variable | Default | Effect |
|---|---|---|
| `gravityForce` | `0.5` | Downward acceleration per tick. Higher = faster fall and shorter jumps. Affects the character and all enemies. |

Jump height in px is roughly `jumpSpeed * jumpSpeed / (2 * gravityForce) + jumpSpeed / 2`.

## combat

| Variable | Default | Effect |
|---|---|---|
| `hitDamage` | `1` | Damage of every melee hit and of every hit an enemy deals. The fireball has its own damage (`fireball.damage`). |
| `invincibleTicks` | `60` | Ticks the character cannot be hurt again after a hit (60 ticks = 1 second). Without it, an enemy would drain all health within a few ticks because the hitboxes overlap every tick. |

## character

| Variable | Default | Effect |
|---|---|---|
| `width` | `150` | Drawn width in px (the sprite frame is 128x128). If you change the size, also adjust `HITBOX_STANDING` and `HITBOX_WALKING` at the top of `character.class.js`. |
| `height` | `150` | Drawn height in px. Same note as `width`. |
| `maxHealth` | `3` | Health points of the character at the start. Each hit costs `combat.hitDamage`. At 0 the character is dead and cannot be controlled any more. |
| `hurtTicks` | `24` | Ticks of the hurt animation after a hit (60 ticks = 1 second). Walking and jumping are locked meanwhile and the character is pushed away from the enemy. |
| `knockbackSpeed` | `5` | Initial speed of the knockback in px per tick, it fades out linearly over `hurtTicks`. Distance in px is about `knockbackSpeed * hurtTicks / 2` (60 px by default). |
| `deadFrameTicks` | `10` | Ticks per frame of the death animation (6 frames, 10 = 1 second in total). The animation plays once and stays on the last frame. |
| `rollTicks` | `36` | Duration of the roll (60 ticks = 1 second). The roll starts with S or the down arrow on the ground, cannot be cancelled and cannot be started in the air. The character cannot be hurt while rolling. |
| `rollSpeed` | `5` | Speed of the roll in px per tick. Distance in px is `rollSpeed * rollTicks` (180 px by default). |
| `rollCooldownTicks` | `30` | Pause after a roll before the next one is possible (30 ticks = 0.5 seconds). Without it, holding the key would make the character invulnerable all the time. `0` turns the pause off. |
| `attackTicks` | `30` | Duration of the melee attack (60 ticks = 1 second), the 5 attack frames are spread over it. Started with J or X by a new key press, a held key does not repeat it and key presses during a swing are ignored. Walking and jumping stay possible while attacking. |
| `attackHitStartTick` | `12` | Tick of the attack at which the sword starts to hit (the strike frame is the third one, ticks 12 to 17). |
| `attackHitEndTick` | `18` | Tick of the attack at which the hit window closes. Every enemy is hit at most once per swing. |
| `castTicks` | `40` | Duration of the fireball cast animation (60 ticks = 1 second), the 8 frames are spread over it. Started with K or C by a new key press, a held key does not repeat it and key presses during the cast are ignored. Possible in the air, walking and jumping stay possible. |
| `castReleaseTick` | `25` | Tick of the cast at which the fireball is fired (the arm is stretched out at the sixth frame). If the cast is cancelled before, no fireball is fired. |
| `castCooldownTicks` | `60` | Pause after a fired fireball before the next one can be fired (60 ticks = 1 second). Key presses during the pause are ignored. |
| `speed` | `3` | Walking speed in px per tick (3 = 180 px per second). |
| `airSpeedFactor` | `1.25` | Multiplier for the walking speed while in the air. 1.25 = a jump with a direction key covers about a quarter more distance than walking for the same time. 1 = same speed as on the ground. |
| `jumpSpeed` | `11.5` | Initial upward speed of a jump, about 138 px with the default gravity. Reaches a platform 2 tiles (96 px) up, but not 4 tiles (192 px). Raise it to jump higher. |
| `crouchTicks` | `6` | Ticks of the crouch animation before take-off (60 ticks = 1 second). Higher = longer delay between key press and jump. Walking is locked meanwhile. |
| `landTicks` | `9` | Ticks of the landing animation after touching the ground. Walking is locked meanwhile. |
| `apexSpeed` | `3` | Vertical speed range around the top of a jump in which the "top" frame is shown. Higher = that frame is shown longer. |
| `restDelayTicks` | `600` | Ticks without any input before the character sits down (600 = 10 seconds). |
| `restFrameTicks` | `15` | Ticks per frame of the sit-down animation (4 frames, 15 = 1 second in total). |
| `idleFps` | `5` | Animation speed of the idle sprite in frames per second. |
| `walkFps` | `8` | Animation speed of the walk sprite in frames per second. |
| `edgeTolerance` | `12` | How far in px the character can be past the edge of a platform before it falls (the support is checked at the center of the hitbox and 12 px to each side). It also lets a jump land on a platform that was just missed. Enemies do not use it. |
| `leftWallX` | `-60` | Smallest allowed x of the character box. `0` stops the box at the level start, a negative value lets the figure walk closer to the edge (`-60` matches the figure inside the sprite). |
| `rightWallOffset` | `60` | How many px the character box may reach past the level end. Counterpart to `leftWallX`. |

## bear

| Variable | Default | Effect |
|---|---|---|
| `width` | `80` | Drawn width in px. The sprite frame is 40x40, multiples of 40 keep the pixels even. If you change it, also adjust the hitbox in `bear.class.js`. |
| `height` | `80` | Drawn height in px. Same note as `width`. |
| `maxHealth` | `2` | Health points of the bear. Each hit costs the damage of the attacker, at 0 the enemy dies. |
| `speed` | `0.5` | Walking speed in px per tick. Values below 1 look slightly jerky because drawing rounds to whole pixels. |
| `animationFps` | `8` | Animation speed in frames per second. |
| `hurtTicks` | `24` | Ticks of the hurt animation after a non-lethal hit (60 ticks = 1 second). The bear stands still, is pushed away from the attacker and turns towards it. |
| `knockbackSpeed` | `4` | Initial speed of the knockback in px per tick, it fades out linearly over `hurtTicks`. Distance in px is about `knockbackSpeed * hurtTicks / 2` (48 px by default). |
| `deathTicks` | `60` | Time from the death of an enemy until it disappears (60 ticks = 1 second). The 6 death frames are spread over it. A dead enemy does no damage and cannot be hit again. |

## mageBoss

| Variable | Default | Effect |
|---|---|---|
| `width` | `192` | Drawn width in px. The sprite frame is 64x64, multiples of 64 keep the pixels even. If you change it, also adjust the hitbox in `mage-boss.class.js`. |
| `height` | `192` | Drawn height in px. Same note as `width`. |
| `maxHealth` | `15` | Health points of the mage boss. Each hit costs the damage of the attacker (sword 1, fireball 3). |
| `speed` | `0.5` | Walking speed in px per tick, the same as the bear. Used for the patrol and for the chase of the character. |
| `animationFps` | `8` | Animation speed in frames per second. |
| `hurtTicks` | `24` | Ticks of the hurt animation after a non-lethal hit (60 ticks = 1 second). |
| `knockbackSpeed` | `1` | Initial speed of the knockback in px per tick, it fades out linearly over `hurtTicks`. Distance in px is about `knockbackSpeed * hurtTicks / 2` (12 px by default). |
| `deathTicks` | `90` | Time from the death of the boss until it disappears (90 ticks = 1.5 seconds). The 6 death frames are spread over it. |
| `sightTiles` | `7` | How far the boss notices the character to the left and to the right of its hitbox, in tiles (7 tiles = 336 px). |
| `sightAboveTiles` | `2` | How far above its hitbox the boss notices the character, in tiles. Below it the area reaches down to the ground. The character is seen as soon as its hitbox touches the area. The area is drawn as a yellow frame while `debug.showHitboxes` is on. |
| `loseSightTicks` | `60` | How long the character has to stay outside the area while the boss chases it before the boss gives up and starts to search (60 ticks = 1 second). The boss keeps chasing during that time. |
| `sneerTicks` | `60` | Duration of the sneer animation when the boss notices the character (60 ticks = 1 second). Afterwards it chases the character. Before the character enters the area for the first time the boss only stands (idle animation, looking left). |
| `searchTicks` | `60` | How long the boss stands still and looks around after the character left the area (60 ticks = 1 second). Then it walks away from the side where the character vanished and patrols like the bears. |
| `lookSwitchTicks` | `20` | Ticks the boss looks to one side while searching before it looks to the other side (20 ticks = left, right, left within one second). |
| `attackTicks` | `45` | Duration of the fireball attack animation (45 ticks = 0.75 seconds), the 6 frames are spread over it. The boss stands still meanwhile. |
| `fireballReleaseTick` | `28` | Tick of the attack at which the fireball leaves the hand of the boss. |
| `fireballCooldownTicks` | `300` | Pause after a fired fireball before the boss can use it again (300 ticks = 5 seconds). It starts at 0, so the first attack follows right after the first sneer. |
| `fireballDamage` | `1` | Damage of one boss fireball. The character takes no damage while rolling or during the grace time after a hit, the fireball then flies on. |
| `fireballScale` | `3` | Size factor of the boss fireball (the image is 10x10 px). The speed is taken from `fireball.speed`, so it is as fast as the fireball of the character. The boss fireball has no range, it flies to the end of the level. |
| `fireballLowHeight` | `48` | Up to this height of the feet of the character above the feet of the boss (in px) the boss uses the low attack (`attack2`), above it the high attack (`attack3`). |
| `fireballMaxHeight` | `99` | If the feet of the character are higher than this above the feet of the boss, the boss does not attack and keeps chasing until the character is lower again. The cooldown is not used up. |
| `rayCooldownTicks` | `900` | Pause before the boss can use the ray again (900 ticks = 15 seconds). The countdown starts when the boss sees the character for the first time and after every use, so the first ray does not come right away. The ray has priority over the fireball. |
| `rayWindupTicks` | `60` | Duration of the first two frames of the ray attack before the ray starts (60 ticks = 1 second), so the character can dodge. |
| `rayTicks` | `90` | How long the ray exists (90 ticks = 1.5 seconds). It grows in length to the end of the level, gets thicker with the last four frames of the attack animation and does not vanish when it touches the character. |
| `rayDamage` | `2` | Damage of a ray hit. The ray can hit again after the grace time while the character stays in it, rolling lets it pass. |
| `raySpeedFactor` | `2` | The front of the ray grows this many times as fast as the fireball of the character (`fireball.speed`). |
| `rayScale` | `3` | Size factor of the ray (the image is 14x14 px, so the full ray is 42 px thick). |
| `rayMaxHeight` | `48` | The boss only uses the ray when the feet of the character are at most this high above the feet of the boss (in px), so only on the ground. |

## fireball

| Variable | Default | Effect |
|---|---|---|
| `damage` | `3` | Damage of one fireball hit. Health never drops below 0, so an enemy with less health than the damage simply dies. |
| `speed` | `6` | Flight speed in px per tick (6 = 360 px per second). |
| `range` | `420` | Distance in px after which a fireball that has hit nothing vanishes (it stops on its last flight frame and disappears without the impact animation). |
| `flightFps` | `12` | Animation speed of the flight frames (5 frames) in frames per second. |
| `impactFps` | `14` | Animation speed of the impact frames (7 frames) in frames per second. The impact animation only plays when an enemy is hit. |

## item

| Variable | Default | Effect |
|---|---|---|
| `pickupFps` | `14` | Animation speed of the pickup effect (6 frames) that plays once when the character collects an item. Only the character can collect items, enemies cannot. |

## key

| Variable | Default | Effect |
|---|---|---|
| `scale` | `2` | Size factor of the key on the playing field (the key image is 16x16 px, the pickup effect 32x32 px). Whole numbers keep the pixels sharp. The key sits in the middle of its map cell. |
| `animationFps` | `10` | Animation speed of the turning key in frames per second (12 frames). |

## pizza

| Variable | Default | Effect |
|---|---|---|
| `scale` | `2` | Size factor of the pizza on the playing field (the image is 16x16 px). Whole numbers keep the pixels sharp. The pizza sits in the middle of its map cell. |
| `healAmount` | `1` | Health points the pizza heals. At full health the pizza is not collected and stays where it is. |

## donut

| Variable | Default | Effect |
|---|---|---|
| `scale` | `2` | Size factor of the donut on the playing field (the image is 16x16 px). Whole numbers keep the pixels sharp. The donut sits in the middle of its map cell. It refills the energy bar completely and is only collected when the energy is not full. |

## chest

| Variable | Default | Effect |
|---|---|---|
| `scale` | `2` | Size factor of the chest on the playing field (the image is 32x32 px). Whole numbers keep the pixels sharp. The chest stands on the bottom edge of its map cell. |
| `openDistance` | `48` | How close the character has to be to open the chest, in px measured from the sides of the chest (48 = one tile). The character needs a key, one key is used up when the chest opens. |
| `openFps` | `8` | Animation speed of the opening in frames per second (8 frames, plays once and stays open). |
| `openSoundFrame` | `5` | Frame of the opening animation (0 to 7) at which the chest sound starts. 0 is the start of the animation, 4 is the turned key, 5 is the lid starting to open. |
| `portalOffset` | `2` | How many map cells to the right of the chest the portal appears once the chest is fully open. |

## portal

| Variable | Default | Effect |
|---|---|---|
| `size` | `96` | Size of the portal in px (the images are 128x128 px). It stands on the bottom edge of its map cell. Touching its centre starts the boss level. |
| `animationFps` | `8` | Speed of the turning portal in frames per second (3 images in a loop). |
| `appearTicks` | `30` | Ticks the portal needs to grow from its centre to full size (30 ticks = 0.5 seconds). It can only be entered when it is fully grown. |

## transition

| Variable | Default | Effect |
|---|---|---|
| `expandTicks` | `36` | Ticks the portal vortex needs to grow until it covers the whole canvas (36 ticks = 0.6 seconds). The game is paused meanwhile (`world.isPaused`). The portal sound `portal.mp3` is cut to this length. |
| `contractTicks` | `36` | Ticks the vortex needs to shrink around the character in the new level and disappear (36 ticks = 0.6 seconds). The game continues afterwards. The sound `portal-reverse.mp3` is cut to this length. |
| `spinFps` | `12` | Speed of the turning vortex during the transition in frames per second (3 images in a loop). |

While the transition runs, the level is switched under the covered canvas. The same pause (`world.isPaused`) is meant for the pause button later.

## energy

| Variable | Default | Effect |
|---|---|---|
| `maxCharges` | `5` | Number of fireball charges the character can hold. The energy bar fills and empties in steps of one charge. |
| `startCharges` | `5` | Charges at the start of the game. Every fired fireball uses one charge, at 0 charges no fireball can be fired. There is no automatic recharge, charges will come from items later. |

## ui

| Variable | Default | Effect |
|---|---|---|
| `statusBarScale` | `2` | Size factor of the status bars (the bar image is 96x12 px). Whole numbers keep the pixels sharp. |
| `statusBarX` | `12` | Distance of the health bar from the left edge of the canvas in px. |
| `statusBarY` | `12` | Distance of the health bar from the top edge of the canvas in px. |
| `energyBarY` | `44` | Distance of the energy bar from the top edge of the canvas in px (it sits below the health bar). |
| `keyIconY` | `76` | Distance of the collected key icons from the top edge of the canvas in px (they sit below the energy bar). |
| `keyIconSpacing` | `36` | Horizontal distance between two key icons in px. |
| `keyIconScale` | `2` | Size factor of the key icons (the key image is 16x16 px). Whole numbers keep the pixels sharp. |
| `blinkTicks` | `60` | How long a lost segment of a bar blinks before it stays empty (60 ticks = 1 second). |
| `blinkIntervalTicks` | `6` | Ticks the blinking segment is visible or hidden (6 ticks = 0.1 second). |
| `bossBarScale` | `1` | Size factor of one bar of the boss health display (the bar image is 96x12 px). The boss health is shown as several of these bars in a row at the bottom center of the canvas. It appears when the boss has seen the character for the first time. |
| `bossBarGap` | `0` | Space between two bars of the boss health display in px. |
| `bossBarMargin` | `12` | Distance of the boss health display from the bottom edge of the canvas in px. |
| `bossBarHealthPerBar` | `3` | Boss health points shown by one bar (3 segments). The number of bars is `mageBoss.maxHealth` divided by this value (15 / 3 = 5 bars). |
| `pauseOverlayAlpha` | `0.5` | Opacity of the black layer over the canvas while the game is paused with the pause button or the Esc key (0 = invisible, 1 = fully black). |

## debug

| Variable | Default | Effect |
|---|---|---|
| `startInBossLevel` | `true` | Starts the game directly in the boss level to test the boss. Set to `false` for release. |
| `showHitboxes` | `true` | Draws the hitboxes (green, red while an enemy touches the character), the sword hit box while it can hit (orange) and the fireballs (orange). Set to `false` for release. |

## Sounds

The volumes, paths and the loop speed live in `scripts/sound-settings.js`, the playing is done by `classes/models/sound-manager.class.js`.
Every value is between `0` and `1`. For sound effects `0.5` is the maximum. A new sound needs an entry in `SOUND_PATHS` and in `SOUND_VOLUMES` (music in `MUSIC_PATHS` and `MUSIC_VOLUMES`).
The mute button (state in the local storage under `spellbound-muted`) mutes all sounds, music and loops.

| Sound | Default volume | Plays when |
|---|---|---|
| `menuClick` | `0.3` | Click on a menu button (main menu, dialogs, game over and victory screen) |
| `menuHover` | `0.5` | Mouse over a menu button |
| `pauseOpen` | `0.3` | The pause opens (button or Esc) |
| `pauseClose` | `0.3` | The pause closes (Continue, Esc, Retry or Home in the pause menu) |
| `gameOver` | `0.5` | The character died and the game over screen appears |
| `victory` | `0.5` | The boss is defeated and the victory screen appears |
| `jump` | `0.4` | The character leaves the ground |
| `land` | `0.4` | The character lands on the ground or on a platform |
| `roll` | `0.4` | The dodge roll starts |
| `attack` | `0.4` | The melee attack starts |
| `cast` | `0.4` | The cast of the fireball starts |
| `fireballImpact` | `0.4` | A fireball hits a target (character fireball on an enemy, boss fireball on the character) |
| `noEnergy` | `0.3` | The special attack key is pressed with an empty energy bar |
| `walk` | `0.5` | Footsteps, loop while the character walks on the ground (speed `1.1` from `LOOP_RATES`) |
| `hurt` | `0.4` | The character takes damage |
| `collect` | `0.2` | A key, a pizza or a donut is collected |
| `snore` | `0.3` | Loop while the character sits after the rest delay |
| `chestOpen` | `0.3` | The lid of the chest starts to open (`chest.openSoundFrame`) |
| `portalEnter` | `0.4` | The portal vortex grows (cut to the length of `transition.expandTicks`) |
| `portalExit` | `0.4` | The portal vortex shrinks (cut to the length of `transition.contractTicks`) |
| `enemyHit` | `0.4` | An enemy or the boss is hit without dying |
| `bearDeath` | `0.4` | The killing hit on a bear |
| `bossDeath` | `0.2` | The killing hit on the boss |
| `bossFireball` | `0.4` | A fireball attack of the boss starts |
| `bossRay` | `0.3` | The ray attack of the boss starts (windup and ray, cut to 2.5 seconds) |

| Music | Default volume | Plays when |
|---|---|---|
| `menuMusic` | `0.1` | Main menu |
| `forestMusic` | `0.3` | Level one |
| `bossMusic` | `0.1` | The boss sees the character for the first time |

`LOOP_RATES` sets the playback speed of a loop (`1` is the speed of the file). The footsteps use `1.1` to match the walk animation.

## Not part of the settings

These values are fixed in the code on purpose.

| What | Where | Why |
|---|---|---|
| Image paths and frame counts | `character-sprites.js`, `bear.class.js`, `mage-boss.class.js`, `fireball.class.js`, `boss-fireball.class.js`, `boss-ray.class.js`, `key.class.js`, `pizza.class.js`, `donut.class.js`, `chest.class.js`, `portal.class.js` | They are facts of the sprite sheets. A new character is a new entry in `CHARACTER_SPRITES`. |
| Hitboxes of the character and the sword (`HITBOX_STANDING`, `HITBOX_WALKING`, `ATTACK_HITBOX`) | `character.class.js`, `character-actions.class.js` | They are shared by all characters, so every sprite set plays the same. They are measured from the fire wizard sprites. |
| Hitbox of the bear, the mage boss, the fireball, the key and the chest, `FIREBALL_SPAWN`, `BOSS_FIREBALL_SPAWN`, `BOSS_RAY_SPAWN`, `RAY_STAGE_ROWS` | `bear.class.js`, `mage-boss.class.js`, `fireball.class.js`, `collectible.class.js`, `chest.class.js` | They are measured from the sprites. |
| Tile map with the markers for items (60 key, 61 pizza, 62 donut, 63 chest, up to 68), the player start (69), enemies (70 to 89) and bosses (90 to 99), parallax factors | `classes/levels/level-one.js`, `level-one-boss.js` | They belong to the level. The numbers are listed in `classes/levels/tile-reference.html`. |
| `TILE_SIZE`, `TILE_COLUMNS`, `WALKABLE_TILE_IDS`, `EMPTY_TILE_ID`, `XX`, `FIRST_MARKER_ID`, `PLAYER_START_ID` | `tile.class.js` | They depend on the tileset and on the numbering of the map. |
| `ENEMY_MARKERS`, `ITEM_MARKERS` | `enemy-markers.js`, `item-markers.js` | They connect a marker number with an enemy or item class. |
| `SPIRAL_RADIUS_RATIO` | `portal-transition.class.js` | The vortex image fills about 40 % of its width as a circle, the transition uses this to cover the canvas completely. |
| `BACKGROUND_WIDTH` | `background-object.class.js` | It depends on the size of the background images. |
| `VISIBLE_MARGIN` | `world.class.js` | Objects up to this many px outside of the screen are still drawn, so that wide sprites never pop in or out. Everything further away is skipped to keep the game fast on phones. |
| Images of the status bars | `hud.class.js` | They are facts of the bar images. |
| `TICKS_PER_SECOND` | `helper-functions.js` | All speeds and tick counts in the settings are tuned for 60 ticks per second. Changing it changes the speed of the whole game. |
