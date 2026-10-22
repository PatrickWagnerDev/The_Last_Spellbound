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
| `leftWallX` | `-60` | Smallest allowed x of the character box. `0` stops the box at the level start, a negative value lets the figure walk closer to the edge (`-60` matches the figure inside the sprite). |
| `rightWallOffset` | `60` | How many px the character box may reach past the level end. Counterpart to `leftWallX`. |

## enemy

| Variable | Default | Effect |
|---|---|---|
| `width` | `80` | Drawn width in px. The sprite frame is 40x40, multiples of 40 keep the pixels even. If you change it, also adjust the hitbox in `enemy.class.js`. |
| `height` | `80` | Drawn height in px. Same note as `width`. |
| `maxHealth` | `2` | Health points of the bear. Other enemy types will get their own values. Each hit costs the damage of the attacker, at 0 the enemy dies. |
| `speed` | `0.5` | Walking speed in px per tick. Values below 1 look slightly jerky because drawing rounds to whole pixels. |
| `animationFps` | `8` | Animation speed in frames per second. |
| `hurtTicks` | `24` | Ticks of the hurt animation after a non-lethal hit (60 ticks = 1 second). The bear stands still, is pushed away from the attacker and turns towards it. |
| `knockbackSpeed` | `4` | Initial speed of the knockback in px per tick, it fades out linearly over `hurtTicks`. Distance in px is about `knockbackSpeed * hurtTicks / 2` (48 px by default). |
| `deathTicks` | `60` | Time from the death of an enemy until it disappears (60 ticks = 1 second). The 6 death frames are spread over it. A dead enemy does no damage and cannot be hit again. |

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

## debug

| Variable | Default | Effect |
|---|---|---|
| `showHitboxes` | `true` | Draws the hitboxes (green, red while an enemy touches the character), the sword hit box while it can hit (orange) and the fireballs (orange). Set to `false` for release. |

## Not part of the settings

These values are fixed in the code on purpose.

| What | Where | Why |
|---|---|---|
| Image paths and frame counts | `character-sprites.js`, `enemy.class.js`, `fireball.class.js`, `key.class.js`, `pizza.class.js`, `donut.class.js`, `chest.class.js` | They are facts of the sprite sheets. A new character is a new entry in `CHARACTER_SPRITES`. |
| Hitboxes of the character and the sword (`HITBOX_STANDING`, `HITBOX_WALKING`, `ATTACK_HITBOX`) | `character.class.js` | They are shared by all characters, so every sprite set plays the same. They are measured from the fire wizard sprites. |
| Hitbox of the bear, the fireball, the key and the chest, `FIREBALL_SPAWN` | `enemy.class.js`, `fireball.class.js`, `collectible.class.js`, `chest.class.js` | They are measured from the sprites. |
| Tile map with the markers for items (60 key, 61 pizza, 62 donut, 63 chest, up to 68), the player start (69), enemies (70 to 89) and bosses (90 to 99), parallax factors | `classes/levels/level-one.js` | They belong to the level. The numbers are listed in `classes/levels/tile-reference.html`. |
| `TILE_SIZE`, `TILE_COLUMNS`, `WALKABLE_TILE_IDS`, `EMPTY_TILE_ID`, `XX`, `FIRST_MARKER_ID`, `PLAYER_START_ID` | `tile.class.js` | They depend on the tileset and on the numbering of the map. |
| `ENEMY_MARKERS`, `ITEM_MARKERS` | `enemy.class.js`, `item-markers.js` | They connect a marker number with an enemy or item class. |
| `BACKGROUND_WIDTH` | `background-object.class.js` | It depends on the size of the background images. |
| Images of the status bars | `world.class.js` | They are facts of the bar images. |
| `TICKS_PER_SECOND` | `helper-functions.js` | All speeds and tick counts in the settings are tuned for 60 ticks per second. Changing it changes the speed of the whole game. |
