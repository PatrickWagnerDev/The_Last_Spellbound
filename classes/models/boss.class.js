const CALM_STATES = ['wait', 'patrol', 'jump', 'return'];

/**
 * Base class of the bosses. It runs a state machine: wait or patrol until the boss sees the character, then
 * sneer, chase and attack, and search and patrol again when the character is lost. Subclasses add their own
 * states and attacks. The first time the boss notices the character, the boss music starts.
 */
class Boss extends SightEnemy {
    isBoss = true;
    state = 'wait';
    stateTicks = 0;
    vanishSide = 1;
    outOfSightTicks = 0;
    hasNoticed = false;

    /**
     * Builds the boss like any enemy and remembers the name of its music.
     * @param {number} column - Map column of the boss.
     * @param {number} row - Map row of the boss.
     * @param {object} config - Config of the boss type, including the name of its music.
     */
    constructor(column, row, config){
        super(column, row, config);
        this.musicName = config.music;
    }

    /**
     * Runs the behavior of one tick: counts the time in the state, updates the waiting times, stops if the
     * character is dead and runs the update of the current state.
     * @returns {void}
     */
    updateBehavior(){
        this.stateTicks++;
        this.updateCooldowns();
        this.stopWhenCharacterDead();
        this.getStateUpdates()[this.state]();
    }

    /**
     * Sends the boss on patrol at once if the character is dead, except in the calm states, which end on
     * their own.
     * @returns {void}
     */
    stopWhenCharacterDead(){
        if(this.world.character.isDead() && !CALM_STATES.includes(this.state)){
            this.setState('patrol');
        }
    }

    /**
     * Returns which update method belongs to which state. Subclasses add their own states.
     * @returns {Object<string, function(): void>} The update method of each state.
     */
    getStateUpdates(){
        return {
            wait: () => this.updateWait(),
            patrol: () => this.updatePatrol(),
            sneer: () => this.updateSneer(),
            chase: () => this.updateChase(),
            search: () => this.updateSearch()
        };
    }

    /**
     * Hook for subclasses that count their waiting times down every tick. Does nothing here.
     * @returns {void}
     */
    updateCooldowns(){
    }

    /**
     * Switches to a state and restarts the time counter of the state.
     * @param {string} stateName - Name of the new state.
     * @returns {void}
     */
    setState(stateName){
        this.state = stateName;
        this.stateTicks = 0;
    }

    /**
     * Runs a tick of the waiting state: the boss stands still and starts to sneer when it sees the character.
     * @returns {void}
     */
    updateWait(){
        this.showLoopState('idle', this.settings.animationFps);
        if(this.isCharacterInSight()){
            this.startSneer();
        }
    }

    /**
     * Runs a tick of the patrol state: the boss walks back and forth and starts to sneer when it sees the
     * character.
     * @returns {void}
     */
    updatePatrol(){
        if(this.isCharacterInSight()){
            this.startSneer();
            return;
        }
        this.showLoopState('walk', this.settings.animationFps);
        this.patrolPlatform();
    }

    /**
     * Starts the sneer: the boss looks at the character, switches to the sneer state and notes that it has
     * noticed the character.
     * @returns {void}
     */
    startSneer(){
        this.faceCharacter();
        this.setState('sneer');
        this.markNoticed();
    }

    /**
     * Notes that the boss has noticed the character. The first time it also runs onFirstNotice.
     * @returns {void}
     */
    markNoticed(){
        if(!this.hasNoticed){
            this.hasNoticed = true;
            this.onFirstNotice();
        }
    }

    /**
     * Runs when the boss notices the character for the first time: starts the music of the boss.
     * @returns {void}
     */
    onFirstNotice(){
        soundManager.playMusic(this.musicName);
    }

    /**
     * Runs a tick of the sneer state: the boss looks at the character and plays the sneer animation once,
     * then it starts to chase.
     * @returns {void}
     */
    updateSneer(){
        this.faceCharacter();
        this.showProgressState('sneer', this.stateTicks, this.settings.sneerTicks);
        if(this.stateTicks >= this.settings.sneerTicks){
            this.startChase();
        }
    }

    /**
     * Starts the chase: resets the time out of sight and switches to the chase state.
     * @returns {void}
     */
    startChase(){
        this.outOfSightTicks = 0;
        this.setState('chase');
    }

    /**
     * Keeps track of the sight during the chase: while the character is seen the time out of sight restarts
     * and the boss remembers on which side the character is, otherwise the time out of sight counts up.
     * @returns {void}
     */
    trackSight(){
        if(this.isCharacterInSight()){
            this.outOfSightTicks = 0;
            this.vanishSide = this.getCharacterOffset() >= 0 ? 1 : -1;
        } else {
            this.outOfSightTicks++;
        }
    }

    /**
     * Runs a tick of the chase state: the boss gives up when the character was out of sight for too long,
     * otherwise it looks at the character and either attacks or walks towards it.
     * @returns {void}
     */
    updateChase(){
        this.trackSight();
        if(this.outOfSightTicks >= this.settings.loseSightTicks){
            this.loseSight();
            return;
        }
        this.faceCharacter();
        if(!this.tryStartAttack()){
            this.walkTowardCharacter();
        }
    }

    /**
     * Runs when the boss has lost the character: switches to the search state. Subclasses change this.
     * @returns {void}
     */
    loseSight(){
        this.setState('search');
    }

    /**
     * Hook for the attacks of a boss type: starts an attack if one is possible. Does nothing here.
     * @returns {boolean} True if an attack was started, always false here.
     */
    tryStartAttack(){
        return false;
    }

    /**
     * Walks towards the character with the walk animation, but not when it is already very close and never
     * over an edge. Subclasses with a sprint or jumps override it.
     * @returns {void}
     */
    walkTowardCharacter(){
        this.showLoopState('walk', this.settings.animationFps);
        if(Math.abs(this.getCharacterOffset()) > 4 && !this.shouldTurn()){
            this.moveForward();
        }
    }

    /**
     * Runs a tick of the search state: the boss sneers again if it sees the character, otherwise it stands and
     * looks around, and after some time it gives up and patrols.
     * @returns {void}
     */
    updateSearch(){
        if(this.isCharacterInSight()){
            this.startSneer();
            return;
        }
        this.showLoopState('idle', this.settings.animationFps);
        this.lookAround();
        if(this.stateTicks >= this.settings.searchTicks){
            this.otherDirection = this.vanishSide > 0;
            this.setState('patrol');
        }
    }

    /**
     * Makes the boss look to the side where the character vanished and to the other side in turns.
     * @returns {void}
     */
    lookAround(){
        const LOOKS_TO_VANISH_SIDE = Math.floor(this.stateTicks / this.settings.lookSwitchTicks) % 2 === 0;
        this.otherDirection = LOOKS_TO_VANISH_SIDE ? this.vanishSide < 0 : this.vanishSide > 0;
    }

    /**
     * Ends the death of the boss: only its game loop stops. Unlike other enemies it stays in the level, the
     * world needs it to see that the boss is defeated.
     * @returns {void}
     */
    finishDeath(){
        this.stopAnimation();
    }
}
