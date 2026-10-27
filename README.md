# The Last Spellbound

This project is a jump-and-run game built with HTML, CSS, and JavaScript as an exam assignment for an intensive Frontend Web Development Bootcamp. It focuses on applying object-oriented programming (OOP) principles in JavaScript and demonstrating the skills acquired throughout the course.

## Features

The game currently offers the following features:

- **Character Movement** – Walk, jump and roll through a side-scrolling game world.
- **Combat System** – Defeat enemies with a melee attack or a fireball that costs energy. Enemies that are pushed into a gap die.
- **Enemies** – Meet patrolling bears, mages that shoot fireballs when they see the player, red enemies that wait and dash at the player, the mage boss, who chases the player and attacks with a fireball and a ray, the demon boss, who sprints, jumps over gaps and fights with a club, and the dark knight, who sprints, follows the player over gaps and onto platforms and attacks with four different sword attacks.
- **Collectibles** – Keys open the chest, pizza heals one heart and a donut refills the energy bar.
- **Chest and Portal** – Open the chest to make a portal appear that leads to the boss level.
- **Status Bars** – Monitor the health and the energy of the player in the corner and the health of the boss over its head.
- **Game Screens** – Start with a "Press any key" page, use the start screen, the pause menu, the game-over screen and the victory screen, and go on with the next level, retry or return to the start screen. The game is over when the player falls out of the level.
- **Boss Killer Badge** – When all levels are cleared, a spinning coin with the text "Boss Killer" appears in the main menu.
- **Level Selection** – Choose the level on a selection page after "Start Game". A level is unlocked when the boss of the previous level is defeated; the progress is saved in Local Storage.
- **Character Selection** – Choose between the Fire Wizard and the Lightning Mage on a selection page before the game starts. Both play the same and only differ in their look and in a few sounds.
- **Loading Screen** – Before each level starts, a "Loading..." screen waits until the images and sounds of the level, its boss part and the menus are loaded, so slow connections do not show missing backgrounds or enemies.
- **Game Instructions** – View the controls, the credits and the imprint in dialogs. The imprint can also be opened on the character selection page and in the pause menu.
- **Audio** – Enjoy background music for the start screen, the level and the boss fight, sound effects for the character, the enemies and the menus, and a mute button that is saved in Local Storage.
- **Responsive Layout** – The game scales down on small screens and shows an orientation notice on touch devices in portrait mode.
- **Fullscreen Mode** – Switch between the standard canvas view and fullscreen gameplay with a button on the start screen and in the game.
- **Touch Controls** – Play on mobile devices in landscape mode with on-screen buttons.

## Technologies

- HTML
- CSS
- Vanilla JavaScript

## Credits

The graphics and the font used in this project come from [Craftpix.net](https://craftpix.net). Many thanks for providing these assets.

| Local folder (`assets/image/`) | Original Craftpix pack |
|---|---|
| `01-wizard` | Free Wizard Sprite Sheets Pixel Art (529677) |
| `02-wizard-extras` | Wizard Pixel Art Sprites Pack 2 (902518) |
| `03-monsters` | Tiny Monsters Pixel Art Pack (987745) |
| `04-bosses` | Boss Monsters Pixel Art (897123) |
| `05-mega-boss` | Mega Boss for Pixel Platformer Character Pack (809571) |
| `06-tileset` | Platformer Pixel Art Tileset (891177) |
| `07-forest-backgrounds` | Pixel Art Forest 2D Backgrounds (661711) |
| `08-magic-effects` | Pixel Art Magic Sprite Effects and Icons Pack (671189) |
| `09-ui` | Game UI Pixel Art (781165) |

The font `assets/fonts/Straight pixel gothic.otf` is the Straight Pixel Gothic Font (532173) from Craftpix.net.

The font `assets/fonts/Planes_ValMore.ttf` is part of the Game UI Pixel Art pack (781165) from Craftpix.net.

The images in `assets/image/07-forest-backgrounds/PNG/Forest1/Small`, `Forest2/Small` and `Forest3/Small` are copies of the Bright layers of Forest1, Forest2 and Forest3 (Pixel Art Forest 2D Backgrounds, 661711) from Craftpix.net, scaled down to 720x480 px so that the game runs smoothly on mobile devices. The original layers are not part of this repository.

The icon `assets/icons/Fullscreen_exit.png` is derived from an icon of the Game UI Pixel Art pack (781165) from Craftpix.net: the two arrows of the fullscreen icon were turned around.

### Sound Credits

The music and sound effects come from [Freesound.org](https://freesound.org) (my collection: [The Last Spellbound](https://freesound.org/collections/756488-the-last-spellbound/)). Many thanks to all the creators for sharing their sounds! Some sounds were converted to mp3, shortened or lowered in pitch.

| Sound | Author | License |
|---|---|---|
| [Boss Battle Loop #3](https://freesound.org/people/Sirkoto51/sounds/443128/) | Sirkoto51 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Button_Hover (mp3)](https://freesound.org/people/deadsillyrabbit/sounds/251390/) | deadsillyrabbit | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [buzzer](https://freesound.org/people/Loyalty_Freak_Music/sounds/407466/) | Loyalty_Freak_Music | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Chainmail Rustle Sound](https://freesound.org/people/beezlefm/sounds/512134/) | BeezleFM | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Club](https://freesound.org/people/thecrow_br/sounds/577354/) | thecrow_br | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Dope Video Game Boss Music](https://freesound.org/people/Seth_Makes_Sounds/sounds/683457/) | Seth_Makes_Sounds | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Dual Energy Daggers 5](https://freesound.org/people/ejfortin/sounds/49667/) | ejfortin | [Sampling+ 1.0](http://creativecommons.org/licenses/sampling+/1.0/) |
| [Electronic Victory Sound](https://freesound.org/people/yokomatsuko/sounds/856038/) | yokomatsuko | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Enimey_Dead](https://freesound.org/people/bigspider95/sounds/500272/) | bigspider95 | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Fantasy Forest](https://freesound.org/people/16Pixel/sounds/785711/) | 16Pixel | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Fireball Cast 3](https://freesound.org/people/LiamG_SFX/sounds/334237/) | LiamG_SFX | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Fireball Explosion](https://freesound.org/people/Blankened/sounds/431174/) | Blankened | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Firework Single ( Explosion )](https://freesound.org/people/EminYILDIRIM/sounds/553153/) | EminYILDIRIM | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [forest theme orchestral loop](https://freesound.org/people/Ehved/sounds/727920/) | Ehved | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Hit_Hurt7](https://freesound.org/people/n_audioman/sounds/273563/) | n_audioman | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [hurt_player](https://freesound.org/people/FullStackSound/sounds/662465/) | FullStackSound | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Interface, magic, fireball, bell, spell](https://freesound.org/people/FALL-E/sounds/714744/) | FALL-E | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [jump_player](https://freesound.org/people/FullStackSound/sounds/662463/) | FullStackSound | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [land a jump](https://freesound.org/people/zepurple/sounds/540272/) | zepurple | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Laser shotgun loading](https://freesound.org/people/beman87/sounds/169679/) | beman87 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| [Metal Forest](https://freesound.org/people/davo32/sounds/628385/) | davo32 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Monster Dying](https://freesound.org/people/Zulfish/sounds/704635/) | Zulfish | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Open Treasure Chest 8 Bit](https://freesound.org/people/Mrthenoronha/sounds/519630/) | Mrthenoronha | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) |
| [Pause rpg (PSX UI SFX Free)](https://freesound.org/people/heyheytheree/sounds/873101/) | heyheytheree | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Player Death](https://freesound.org/people/luminousfridge/sounds/409343/) | luminousfridge | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Portal](https://freesound.org/people/BigDino1995/sounds/697634/) | BigDino1995 | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Retro Collection 3](https://freesound.org/people/Xiko__/sounds/711129/) | Xiko__ | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Roll](https://freesound.org/people/DrMrSir/sounds/529563/) | DrMrSir | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [SNORE-03_44100](https://freesound.org/people/stevielematt/sounds/760036/) | stevielematt | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Somber Piano Chord Progression D 76bpm](https://freesound.org/people/CVLTIV8R/sounds/807111/) | CVLTIV8R | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [steps](https://freesound.org/people/benzix2/sounds/417291/) | benzix2 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| [Super Mega Ultimate Final Boss Battle](https://freesound.org/people/FoolBoyMedia/sounds/530064/) | FoolBoyMedia | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) |
| [Sword Swing 1](https://freesound.org/people/Nomagician/sounds/840716/) | Nomagician | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| [Sword_Thunder01](https://freesound.org/people/SonoFxAudio/sounds/649360/) | SonoFxAudio | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Tab rpg (PSX UI SFX Free)](https://freesound.org/people/heyheytheree/sounds/873105/) | heyheytheree | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [Unpause rpg (PSX UI SFX Free)](https://freesound.org/people/heyheytheree/sounds/873112/) | heyheytheree | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |

The chest sound and the prepared FoolBoyMedia track are licensed for non-commercial use only. This project is a student project without a commercial purpose.

## AI Assistance

This project was developed with the support of an AI assistant (Claude Code by Anthropic). The use of AI is officially approved by my educational institution.

The assistant helped with planning, writing and refactoring the code and with the documentation. Every step was shown first, then reviewed, tested in the browser and approved by me before it was committed, and every change is documented in `logs/debug.log`. The game idea, the design decisions and the responsibility for the project are mine.

## What I Learned

The main focus of this project is learning and applying object-oriented programming (OOP) in JavaScript. Through developing the game, I aim to deepen my understanding of classes, objects, inheritance, and how they interact to create a structured and maintainable application.

<!--
WHAT I LEARNED:

Update this section during or after development.
Focus on what you actually learned or improved while working on the project.

Possible topics include object-oriented programming, game loops,
collision detection, animation handling, and managing game states.

Describe your most relevant learnings in 2–4 sentences instead of
simply repeating the technologies or features listed above.
-->

## Project Status

> **Current Status:** Submitted for Review

Development is complete and the project has been submitted for evaluation. The gameplay, the menus, the dialogs, the audio, the fullscreen mode and the touch controls are finished, the final playtest and the code check are done and every function is documented with JSDoc.

<!--
PROJECT STATUS:

Update only the "Current Status" and the short description above whenever the project progresses.

Examples:

> **Current Status:** In Development

The project is currently being developed.

> **Current Status:** Submitted for Review

Development is complete and the project has been submitted for evaluation.

> **Current Status:** Completed

The project has been completed successfully.
-->

## Local Development

Clone the repository:

```bash
git clone https://github.com/PatrickWagnerDev/The_Last_Spellbound.git
```

Open the project in **Visual Studio Code** and start `index.html` using the **Live Server** extension.

## About

This project was created as part of the **Frontend Web Developer Bootcamp at Developer Akademie**.

It is a personal examination and portfolio project and is not intended for production use. External contributions are not accepted.

## License

No license has been assigned to this project.

This project was created for educational and portfolio purposes and is not distributed under an open-source license.

## Author

**PatrickWagnerDev**