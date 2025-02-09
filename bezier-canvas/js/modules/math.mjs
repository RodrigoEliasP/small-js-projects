/**
 * @typedef { import("../index.mjs").CartesianLocatable } CartesianLocatable
 */ 

/**
 * 
 * @param  {...CartesianLocatable} points 
 */
export const calculateTheClosestPointToNPoints = (...points) => {
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
 * @returns {number}
 */
export const calculateDistanceBetweenPoints = (a, b) => {
    const difference = operateOnPoints(a, b, 'sub');
    return Math.sqrt((difference.x ** 2) + (difference.y ** 2))
};

/**
 * 
 * @param {CartesianLocatable} newA 
 * @param {CartesianLocatable} newB
 * @param {'sum' | 'sub' | 'div' | 'mult'} operation
 * @param {{ divisionByZeroValue: 'error' | 'ignore' }} options
 * @returns { CartesianLocatable } 
 */
export const operateOnPoints = (a, b, operation = 'sum', { divisionByZeroValue } = { divisionByZeroValue: 'error' }) => {
    const newA = typeof a === 'number' ? { x: a, y: a } : a;
    const newB = typeof b === 'number' ? { x: b, y: b } : b;
    switch (operation) {
        case 'sum':
            return  {
                x: newA.x + newB.x,
                y: newA.y + newB.y,
            }
        case 'sub':
            return  {
                x: newA.x - newB.x,
                y: newA.y - newB.y,
            }
        case 'mult':
            return  {
                x: newA.x * newB.x,
                y: newA.y * newB.y,
            }
        case 'div':
            if(newB.x && newB.y === 0) {
                if(divisionByZeroValue === 'error') {
                    throw Error('division by zero cannot be performed on operateOnPoints');
                } else {
                    return newA;
                }
            }
            return  {
                x: newB.x === 0 ? divisionByZeroValue : newA.x / newB.x,
                y: newB.y === 0 ? divisionByZeroValue : newA.y / newB.y,
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
 * @param {{ color: string; lineWidth: number; }} options
 * 
 */
export const drawLine = (ctx, a, b, { color = 'black', lineWidth = 1  } = { }) => {
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.strokeStyle = color
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.lineWidth = 1; 
}