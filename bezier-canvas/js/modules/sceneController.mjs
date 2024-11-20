export class SceneController {
    /**
     *  
     * @param { typeof import('./configs.mjs').configs } configs
     */
    constructor(configs) {
        this.type = configs.animation.type;
        this.configs = configs;
        this.#changeModeIfNecessary(this.type);
    }
    /**
     * 
     *  @param {'auto' | 'man'} type 
     */
    #changeModeIfNecessary(type) {
        if(this.animationCache?.type !== type) {
            this.animationCache = { ...this.configs.animation };
            this.moment = 0;
            this.going = true;
            this.step = 1;
        }
    }
    /**
     * 
     *  @param {'auto' | 'man'} type 
     */
    getAnimationMoment(type) {
        this.#changeModeIfNecessary(type);
        let t = 0;
        switch (type) {
            case 'man':
                t = this.configs.animation.moment;
            break;

            case 'auto':
                const maxRange = 100 * (2.25 - this.animationCache.speed);
                this.moment = this.moment + (this.step * (this.going ? 1 : -1) );
                if(this.going) {
                    this.going = this.moment !== maxRange;
                } else {
                    this.going = this.moment === 0;
                }
                t = this.moment / maxRange;
            break;
            default:
                break;
        }
        return t;
    }
}