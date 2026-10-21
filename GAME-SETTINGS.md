# Game Settings

All tunable values live in `scripts/game-settings.js` in the object `GAME_SETTINGS`.
The game runs at 60 ticks per second, all speeds are given per tick.

## physics

| Variable | Default | Effect |
|---|---|---|
| `gravityForce` | `0.5` | Downward acceleration per tick. Higher = faster fall and shorter jumps. Affects the character and all enemies. |

Jump height in px is roughly `jumpSpeed * jumpSpeed / (2 * gravityForce) + jumpSpeed / 2`.

## character

| Variable | Default | Effect |
|---|---|---|
| `width` | `150` | Drawn width in px (the sprite frame is 128x128). If you change the size, also adjust `HITBOX_STANDING` and `HITBOX_WALKING` at the top of `character.class.js`. |
| `height` | `150` | Drawn height in px. Same note as `width`. |
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
| `speed` | `0.5` | Walking speed in px per tick. Values below 1 look slightly jerky because drawing rounds to whole pixels. |
| `animationFps` | `8` | Animation speed in frames per second. |

## debug

| Variable | Default | Effect |
|---|---|---|
| `showHitboxes` | `true` | Draws the hitboxes (green, red while an enemy touches the character). Set to `false` for release. |

## Not part of the settings

| What | Where | Why |
|---|---|---|
| Image paths and frame counts | `character.class.js`, `enemy.class.js` | They are facts of the sprite sheets. |
| Hitbox offsets | `character.class.js`, `enemy.class.js` | They are measured from the sprites. |
| Parallax factors, enemy spawns, tile map | `classes/levels/level-one.js` | They belong to the level. |
| `TILE_SIZE`, `WALKABLE_TILE_IDS` | `tile.class.js` | They depend on the tileset. |
