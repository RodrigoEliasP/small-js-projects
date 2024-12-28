
import { calculateCubicBezierCurvePoint } from "./math.mjs";



/**
 * @class
 * @template FunctionReturn
 * @template FunctionParams
 * @typedef { (...params: FunctionParams) => FunctionReturn } PointsStoreInternalFn
 */
export class MathFunctionStore {

    
    /**
     * @type { Map<number, ReturnType<T> }
     */ 
    #data = new Map();
    /**
     * @type { PointsStoreInternalFn }
     */ 
    #function;
    #cacheId;
    #staticParams;
    #rangeOptions;

    /**
     * 
     * takes an arbitrary fn function, with its static params and generate all values within the range specified on the options
     * it assumes that the variable param is the last function argument, ex: fn(a,b,c,d,t) the t will receive the variable param calculated
     * 
     * @param { { fn: PointsStoreInternalFn, params: FunctionParams } } fn the function to be cached
     * @param {{ min: number; max: number; step: number }} rangeOptions the range options for the variable param for the function
     */
    setConfigs({ fn, params }, rangeOptions) {
        const cacheId = JSON.stringify({ params, rangeOptions });
        if (this.#cacheId !== cacheId) {
            this.resetStore();
            this.#cacheId = cacheId;
        }
        
        this.#function = fn;
        this.#staticParams = params;
         
        if (params.length + 1 !== fn.length) {
            throw new Error('Wrong usage, functionParams should not provide the variable param')
        }

        this.#rangeOptions = rangeOptions;
        this.generateResults()
    }


    /**
     * @param {number} value 
     */
    #setNewResult(value) {
        const result = this.#function(...this.#staticParams, value);
        this.#data.set(value, result);    
    }

    generateResults() {
        for (let i = this.#rangeOptions.min; i <= this.#rangeOptions.max; i += this.#rangeOptions.step) {
            this.#setNewResult(i);
        }
    }

    resetStore() {
        if (this.#data.size > 0) {
            this.#data.clear();
        }
    }

    /**
     * @param {number} value 
     * @returns { FunctionReturn }
     */
    retrieveResult(value) {
        let result = this.#data.get(value);
        if (!result) {
            this.#setNewResult(value);
            result = this.#data.get(value);
        }
        return result;
    }

    /**
     * @returns { [number, FunctionReturn][] }
     */
    retrieveAllResults() {
        return [...this.#data.entries()].sort(([a, _d], [b , _] ) => a-b);
    }
    
    
    
}