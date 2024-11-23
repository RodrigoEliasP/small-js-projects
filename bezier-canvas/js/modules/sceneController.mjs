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
            this.displacement = 0;
            this.going = true;
            this.step = 1;
        }
    }
    /**
     * 
     *  @param {'auto' | 'man'} type 
     */
    getAnimationDisplacement(type) {
        this.#changeModeIfNecessary(type);
        let t = 0;
        switch (type) {
            case 'man':
                t = this.configs.animation.displacement;
            break;

            case 'auto':
                const maxRange = 100 * (2.25 - this.animationCache.speed);
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
}