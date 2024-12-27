
import { calculateCubicBezierCurvePoint } from "./math.mjs";



/**
 * @class
 * @template FunctionReturn
 * @template FunctionParams
 * @typedef { (...params: FunctionParams) => FunctionReturn } PointsStoreInternalFn
 */
export class MathFunctionStore {

    
    /**
     * @type { Map<string, ReturnType<T> }
     */ 
    #data = new Map();
    /**
     * @type { PointsStoreInternalFn }
     */ 
    #function;
    #staticParams;
    #rangeOptions;

    /**
     * 
     * takes an arbitrary fn function, with its static params and generate all values within the range specified on the options
     * it assumes that the variable param is the last function argument, ex: fn(a,b,c,d,t) the t will receive the variable param calculated
     * 
     * @param { PointsStoreInternalFn } fn the function to be cached
     * @param { FunctionParams } staticParams the static params for the functions
     * @param {{ min: number; max: number; step: number }} rangeOptions the range options for the variable param for the function
     */
    setConfigs(fn, functionParams, rangeOptions) {
        this.resetStore();
        this.#function = fn;
        this.#staticParams = functionParams;
         
        if (functionParams.length + 1 !== fn.length) {
            throw new Error('Wrong usage, functionParams should not provide the variable param')
        }

        this.#rangeOptions = rangeOptions;
    }


    /**
     * @param {number} value 
     */
    #setNewResult(value) {
        const result = this.#function(...this.#staticParams, value);
        this.#data.set(value, result);    
    }

    generateResults() {
        this.resetStore();

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
        return [...this.#data.entries()];
    }
    
    
    
}