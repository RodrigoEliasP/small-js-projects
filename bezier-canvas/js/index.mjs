import { configs } from "./modules/configs.mjs"
import { SceneController } from "./modules/sceneController.mjs";
/**
 * @type HTMLCanvasElement
 */
const mainCanvas = document.querySelector('#main-canvas');


const ctx = mainCanvas.getContext('2d');



const { flags } = configs;


function lerp(a, b, t) {
    return a + t * (b  - a);
}

/**
 * @typedef {{ x: number; y: number;}} CartesianLocatable
 * @typedef {{ x: number; y: number; color: string;}} ColorizedCartesianLocatable
 * @typedef {{ x: number; y: number; color: string;}} Point
 * @typedef { { [ x in `${'a'|'b'|'c'|'d'}${'Monomial'}`]: number } } DecomposedMonomials
 * @typedef {{ radius: number | undefined; color:  string; showLocation: boolean; label: string; }} DrawPointsConfigs
*/

/**
 * 
 * @param {CartesianLocatable} a 
 * @param {CartesianLocatable} b
 * @param {'sum' | 'sub' | 'div' | 'mult'} c
 * @returns { CartesianLocatable } 
 */
function calculatePoints(a, b, c = 'sum') {
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
                x: a.x / b.x,
                y: a.y / b.y,
            }
    
        default:
            break;
    }
    
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {CartesianLocatable | ColorizedCartesianLocatable} place
 * @param {number} radius
 * @param {DrawPointsConfigs} options
 */
function drawPoint(ctx, place, options) {
    const { x, y } = place;
    const { 
        radius = 5,
        color = place.color ?? "black", 
        showLocation = flags.showCoordinates,
        label,
    } = options ?? { };
    ctx.fillStyle = 'black';

    let fillText;
    if(showLocation) 
        fillText = (`(${x.toFixed(2)},${y.toFixed(2)})`);
    else if (label) 
        fillText = label;
    if (fillText) {
        ctx.fillText(fillText,x - radius * 2.3, y - 10)
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(place.x, place.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}
/**
 * 
 * @param {CartesianLocatable} a
 * @param {CartesianLocatable} b
 * @param {CartesianLocatable} t
 * @returns {CartesianLocatable}
 */
function calculateInterpolatedPoint(a, b, t) {
    const interpolatedX = lerp(a.x, b.x, t);
    const interpolatedY = lerp(a.y, b.y, t);
    
    return { x: interpolatedX, y: interpolatedY }
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {CartesianLocatable} a
 * @param {CartesianLocatable} b
 * @param {CartesianLocatable} t
 * @param {{ color: string; }} cfg
 * @returns {CartesianLocatable} 
 * 
 */
function drawInterpolatedPoint(ctx, a, b, t, cfg = {}) {
    const { color = 'black' } = cfg;
    const interpolatedPoint = calculateInterpolatedPoint(a, b, t);
    drawPoint(ctx, interpolatedPoint, { color });
}


/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {CartesianLocatable} a
 * @param {CartesianLocatable} b
 * 
 */
function drawLine(ctx, a, b) {
    ctx.beginPath();
    ctx.fillStyle = "black"
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
}
/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
function clearCanvas(ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(-mainCanvas.width/2, -mainCanvas.height/2, mainCanvas.width, mainCanvas.height)
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * 
 */
function drawAxisLines(ctx) {
    const { width, height } = mainCanvas;
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.moveTo(-(width / 2), 0);
    ctx.lineTo(width / 2, 0);
    ctx.moveTo(0, -(height / 2));
    ctx.lineTo(0, height / 2);
    ctx.stroke()
}

if(!ctx) {
    alert('this browser does not support canvas');
}

ctx.translate(mainCanvas.width/2, mainCanvas.height/2);

const pointA = { x: 0, y: -100, label: 'A', color: 'red' };
const pointB = { x: -100, y: 0, label: 'B', color: 'green'};
const pointC = { x: 0, y: 100, label: 'C', color: 'yellow' };
const pointD = { x: 100, y: 0, label: 'D', color: 'purple' };



let mousePoint = {};

const getActualMousePlacement = (e) => {
    let rect = mainCanvas.getBoundingClientRect();
    const padding = -8;
    const { width, height } = mainCanvas;
    const { clientX: canvasX, clientY: canvasY } = e;
    const [ actualX, actualY ] = [canvasX - ((width / 2) + rect.left + padding), canvasY - ((height / 2) + rect.top + padding)];
    return { x: actualX, y: actualY };
}


const allPoints = [pointA, pointB, pointC, pointD];

/**
 * 
 * @param {CartesianLocatable[]} points 
 * @param {CartesianLocatable} place 
 */
function findPointColiding(points, place) {
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const xDiff = (place.x - point.x);
        const yDiff = (place.y - point.y); 
        const hypotenuse = Math.sqrt((xDiff ** 2) + (yDiff ** 2))
        if (hypotenuse > 20) {
            continue;
        }
        return point;
    }
    return undefined;
}
let draggingPoint = undefined;

mainCanvas.addEventListener('mousemove', (e)  => {
    const actualPlacement = getActualMousePlacement(e);
    mousePoint.x = actualPlacement.x - 9;
    mousePoint.y = actualPlacement.y - 9;

    if (draggingPoint) {
        draggingPoint.x = mousePoint.x;
        draggingPoint.y = mousePoint.y;
    }
    
})

mainCanvas.addEventListener('mousedown', (e) => {
    const placement = getActualMousePlacement(e);

    let pointColiding = findPointColiding(allPoints, placement);

    
    if(pointColiding) {
        draggingPoint = pointColiding;
    }
});

mainCanvas.addEventListener('mouseup', (e) => {
    draggingPoint = undefined;
});

function drawCubicBezierCurvePointDeCasteljau(t) {
    const BCInterpolatedPoint_1 = calculateInterpolatedPoint(pointB, pointC, t);
    const ABInterpolatedPoint_1 = calculateInterpolatedPoint(pointA, pointB, t);
    const CDInterpolatedPoint_1 = calculateInterpolatedPoint(pointC, pointD, t);
    const ABCInterpolatedPoint_2 = calculateInterpolatedPoint(
        ABInterpolatedPoint_1, 
        BCInterpolatedPoint_1, 
        t
    );
    const ABDInterpolatedPoint_2 = calculateInterpolatedPoint(
        BCInterpolatedPoint_1, 
        CDInterpolatedPoint_1, 
        t
    );

    const intermediatePoints = [
        ABInterpolatedPoint_1,
        BCInterpolatedPoint_1,
        CDInterpolatedPoint_1,
        ABCInterpolatedPoint_2,
        ABDInterpolatedPoint_2
    ]

    if(flags.showIntermediatePoints) {
        intermediatePoints.forEach((p, i) => {
            drawPoint(ctx, p, [3,4].includes(i) ? { color: 'purple' } : undefined)
        })
    }

    const ABCDInterpolatedPoint_3 = drawInterpolatedPoint(
        ctx, 
        ABCInterpolatedPoint_2, 
        ABDInterpolatedPoint_2, 
        t, {
            color: 'cyan'
        }
    );
    
    if(flags.showLines) {

        drawLine(ctx, ABInterpolatedPoint_1, BCInterpolatedPoint_1);
        drawLine(ctx, BCInterpolatedPoint_1, CDInterpolatedPoint_1);
        drawLine(ctx, ABCInterpolatedPoint_2, ABDInterpolatedPoint_2);
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
function cubicLerp(a, b, c, d, t) {
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
function calculateCubicBezierCurvePoint(a, b, c, d, t) {
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
/**
 * 
 * @param  {...CartesianLocatable} points 
 */
function getTheClosestPointToNPoints(...points) {
    const totalPoints = points.length;

    return points.reduce((acc, cur) => { 
        acc.x += cur.x / totalPoints;
        acc.y += cur.y / totalPoints;
        return acc;
    }, {x: 0, y: 0})
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} t
*/
function drawBernsteinVectors(ctx, t) {
    const closestPoint = getTheClosestPointToNPoints(...allPoints);
    const points = calculateCubicBezierCurvePoint(
        calculatePoints(pointA, closestPoint, 'sub'), 
        calculatePoints(pointB, closestPoint, 'sub'), 
        calculatePoints(pointC, closestPoint, 'sub'), 
        calculatePoints(pointD, closestPoint, 'sub'),
    t);


    drawPoint(ctx, closestPoint, { radius: 2, color: 'lime' });
    let lastPoint = closestPoint
    for (const point of allPoints ) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.strokeStyle = point.color;
        /**
         * @type {'a' | 'b' | 'c' | 'd' }
         */
        const pointLabel = point.label.toLowerCase();
        
        const target = points.monomialSum[pointLabel]

        const endPoint = calculatePoints(target, lastPoint);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
        lastPoint = endPoint
        

    }
    ctx.strokeStyle = 'black'
    

}

function drawCubicBezierCurvePointSingleFunction(t) {
    const pointToDraw = calculateCubicBezierCurvePoint(pointA, pointB, pointC, pointD, t);
    drawPoint(ctx, pointToDraw, { color: 'blue' });
}

function drawBezierCurve() {
    if(!flags.showCurvePath) {
        return
    }
    ctx.fillStyle = 'black'; 
    ctx.moveTo(pointA.x, pointA.y);
    ctx.bezierCurveTo(pointB.x, pointB.y, pointC.x, pointC.y, pointD.x, pointD.y)
    ctx.stroke();
}


function draw(t) {
    clearCanvas(ctx);
    
    if (flags.showAxis) {
        drawAxisLines(ctx);
    }

    if(mousePoint.x && flags.showPointerIndicator) {
        drawPoint(ctx, mousePoint, { radius: 3, color: 'red', showLocation: false  })
    }

    if(flags.showBernstein) {
        drawBernsteinVectors(ctx, t);
    }

    if(flags.showLines) {
        drawLine(ctx, pointA, pointB);
        drawLine(ctx, pointB, pointC);
        drawLine(ctx, pointC, pointD);
    }

    drawBezierCurve();

    drawCubicBezierCurvePointDeCasteljau(t);
    //drawCubicBezierCurvePointSingleFunction(t);
    allPoints.forEach(point => {
        drawPoint(ctx, point, { label: flags.showLabels && point.label });
    })
}

const animationController = new SceneController(configs);

function main() {

    const t = animationController.getAnimationDisplacement(configs.animation.type);
    
    requestAnimationFrame(() => draw(t))
}
setInterval(main, 5)

