export class SceneController {
    /**
     *  
     * @param { typeof import('./configs.mjs').configs } configs
     */
    constructor(configs) {
        this.configs = configs;
        this.#changeModeIfNecessary();
    }

    #changeModeIfNecessary() {
        if(this.animationConfigsReference !== this.configs.animation) {
            this.animationConfigsReference = this.configs.animation;
            this.displacement = 0;
            this.going = true;
            this.step = 1;
        }
    }
    /**
     * 
     *  @param {'auto' | 'man'} type 
     */
    getAnimationDisplacement() {
        this.#changeModeIfNecessary();
        let t = 0;
        switch (this.configs.animation.type) {
            case 'man':
                t = this.configs.animation.displacement / 100;
            break;

            case 'auto':
                const maxRange = this.#getMaxRange();
                this.displacement = this.displacement + (this.step * (this.going ? 1 : -1) );
                if(this.going) {
                    this.going = this.displacement !== maxRange;
                } else {
                    this.going = this.displacement === 0;
                }
                t = this.displacement / maxRange;
            break;
            default:
                break;
        }
        return t;
    }

    #getMaxRange() {
        return 100 * (2.25 - this.configs.animation.speed);
    }

    getRangesForConfiguration() {
        switch (this.configs.animation.type) {
            case 'man':
                return {
                    min: 0,
                    max: 1,
                    step: 0.01
                }
            case 'auto':
                const maxRange = this.#getMaxRange();
                return {
                    min: 0,
                    max: 1,
                    step: 0.01
                }
        }
    }
}