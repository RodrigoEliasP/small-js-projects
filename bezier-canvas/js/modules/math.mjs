/**
 * @typedef { import("../index.mjs").CartesianLocatable } CartesianLocatable
 */ 

/**
 * 
 * @param  {...CartesianLocatable} points 
 */
export const getTheClosestPointToNPoints = (...points) => {
    const totalPoints = points.length;

    return points.reduce((acc, cur) => { 
        acc.x += cur.x / totalPoints;
        acc.y += cur.y / totalPoints;
        return acc;
    }, {x: 0, y: 0})
}

/**
 * 
 * @param {CartesianLocatable} a 
 * @param {CartesianLocatable} b
 * @param {'sum' | 'sub' | 'div' | 'mult'} c
 * @returns { CartesianLocatable } 
 */
export const calculatePoints = (a, b, c = 'sum') => {
    switch (c) {
        case 'sum':
            return  {
                x: a.x + b.x,
                y: a.y + b.y,
            }
        case 'sub':
            return  {
                x: a.x - b.x,
                y: a.y - b.y,
            }
        case 'mult':
            return  {
                x: a.x * b.x,
                y: a.y * b.y,
            }
        case 'div':
            return  {
                x: b.x === 0 ? 0 : a.x / b.x,
                y: b.y === 0 ? 0 : a.y / b.y,
            }
    
        default:
            break;
    }
    
}


/**
 * 
 * @param {number} a 
 * @param {number} b 
 * @param {number} c 
 * @param {number} d 
 * @param {number} t 
 * @returns {{ total: number; decomposedMonomials: DecomposedMonomials }}
 */
const cubicLerp = (a, b, c, d, t) => {
    const aMonomial = a * ( -(t ** 3) + 3 * t ** 2 - 3 * t + 1);
    const bMonomial = b * (3 * t ** 3 - 6 * t ** 2 + 3 * t);
    const cMonomial = c * (- 3 * t ** 3 +  3 * t ** 2);   
    const dMonomial = d * (t ** 3);
    const total = aMonomial + bMonomial + cMonomial + dMonomial;
    const decomposedMonomials = { aMonomial, bMonomial, cMonomial, dMonomial }; 
    return { 
        total, decomposedMonomials };
}

/**
 * 
 * @param {CartesianLocatable} a 
 * @param {CartesianLocatable} b 
 * @param {CartesianLocatable} c 
 * @param {CartesianLocatable} d 
 * @param {number} t 
 * @returns {CartesianLocatable & { monomialSum: { a: CartesianLocatable, b: CartesianLocatable, c: CartesianLocatable, d: CartesianLocatable }}}
 */
export const calculateCubicBezierCurvePoint = (a, b, c, d, t) => {
    const x = cubicLerp(a.x, b.x, c.x, d.x, t);
    const y = cubicLerp(a.y, b.y, c.y, d.y, t);
    return { 
        x: x.total, 
        y: y.total, 
        monomialSum: { 
            a: {
                x: x.decomposedMonomials.aMonomial,
                y: y.decomposedMonomials.aMonomial
            }, 
            b: { 
                x: x.decomposedMonomials.bMonomial,
                y: y.decomposedMonomials.bMonomial
            }, 
            c: { 
                x: x.decomposedMonomials.cMonomial,
                y: y.decomposedMonomials.cMonomial
            }, 
            d: {
                x: x.decomposedMonomials.dMonomial, 
                y: y.decomposedMonomials.dMonomial
            }  
        } 
    }
}

export const lerp = (a, b, t) => {
    return a + t * (b  - a);
}


/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {CartesianLocatable} a
 * @param {CartesianLocatable} b
 * @param {{ color: string }} options
 * 
 */
export const drawLine = (ctx, a, b, { color = 'black' } = {}) => {
    ctx.beginPath();
    ctx.strokeStyle = color
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
}