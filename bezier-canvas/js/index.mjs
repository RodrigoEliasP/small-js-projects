import { configs } from "./modules/configs.mjs"
import { SceneController } from "./modules/sceneController.mjs";
/**
 * @type HTMLCanvasElement
 */
const mainCanvas = document.querySelector('#main-canvas');


const ctx = mainCanvas.getContext('2d');



const { flags } = configs;


function lerp(a, b, c) {
    return a + c * (b  - a);
}

/**
 * @typedef {{ x: number; y: number;}} CartesianLocatable
 */

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {CartesianLocatable} place
 * @param {number} radius
 * @param {{ color:  string; showLocation: boolean; }} options
 */
function drawPoint(ctx, place, radius = 5, options) {
    const { x, y } =  place;
    const { color = "black", showLocation = flags.showCoordinates} = options ?? {};
    ctx.fillStyle = 'black';
    if(showLocation) 
        ctx.fillText(`(${x.toFixed(2)},${y.toFixed(2)})`, x - radius * 2.3, y - 10);
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
    drawPoint(ctx, interpolatedPoint, undefined, { color });
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

const pointA = { x: 0, y: -100 };
const pointB = { x: -100, y: 0 };
const pointC = { x: 0, y: 100 };
const pointD = { x: 100, y: 0 };



let mousePoint = {};

const getActualMousePlacement = (e) => {
    let rect = mainCanvas.getBoundingClientRect();
    const padding = -8;
    const { width, height } = mainCanvas;
    const { clientX: canvasX, clientY: canvasY } = e;
    const [ actualX, actualY ] = [canvasX - ((width / 2) + rect.left + padding), canvasY - ((height / 2) + rect.top + padding)];
    return { x: actualX, y: actualY };
}


const allPoints = [pointB, pointC, pointD, pointA];

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
            drawPoint(ctx, p, undefined, [3,4].includes(i) ? { color: 'green' } : undefined)
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
    
    if(flags.showIntermediateLines) {

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
 * @returns {{ total: number; decomposedMonomials: { [ x in `${'a'|'b'|'c'|'d'}${'Monomial'}`]: number } }}
 */
function cubicLerp(a, b, c, d, t) {
    const aMonomial = ((1 - t) ** 3) * a;
    const bMonomial = 3 * ((1 - t) ** 2) * t * b;
    const cMonomial = 3 * (1 - t) * ( t ** 2 ) * c;   
    const dMonomial = t ** 3 * d;
    return { total: aMonomial + bMonomial + cMonomial + dMonomial, decomposedMonomials: { aMonomial, bMonomial, cMonomial, dMonomial  } };
}

/**
 * 
 * @param {CartesianLocatable} a 
 * @param {CartesianLocatable} b 
 * @param {CartesianLocatable} c 
 * @param {CartesianLocatable} d 
 * @param {number} t 
 * @returns {CartesianLocatable}
 */
function calculateCubicBezierCurvePoint(a, b, c, d, t) {
    const x = cubicLerp(a.x, b.x, c.x, d.x, t);
    const y = cubicLerp(a.y, b.y, c.y, d.y, t);
    return { x: x.total, y: y.total }
}

function drawBernsteinVectors(ctx) {
    const pointsX = calculateCubicBezierCurvePoint(pointA.x, pointB.x, pointC.x, pointD.x);
    const pointsY = calculateCubicBezierCurvePoint(pointA.y, pointB.y, pointC.y, pointD.y);

}

function drawCubicBezierCurvePointSingleFunction(t) {
    const pointToDraw = calculateCubicBezierCurvePoint(pointA, pointB, pointC, pointD, t);
    drawPoint(ctx, pointToDraw, undefined, { color: 'blue' });
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
        drawPoint(ctx, mousePoint, 3, { color: 'red', showLocation: false  })
    }

    drawPoint(ctx, pointB);
    drawPoint(ctx, pointC);
    drawPoint(ctx, pointD);
    drawPoint(ctx, pointA);


    drawCubicBezierCurvePointDeCasteljau(t);
    //drawCubicBezierCurvePointSingleFunction(t);
    if(flags.showBernstein) {
        drawBernsteinVectors(ctx);
    }

    if(flags.showPrimaryLines) {
        drawLine(ctx, pointB, pointC);
        drawLine(ctx, pointC, pointD);
        drawLine(ctx, pointB, pointA);
    }

    drawBezierCurve();
}
let range = 0;
let going = true;
let step = 1;

let animationSpeedCache = configs.animationSpeed;

const animationController = new SceneController(configs);

function main() {

    const t = animationController.getAnimationDisplacement(configs.animation.type);
    
    requestAnimationFrame(() => draw(t))
}
setInterval(main, 5)

