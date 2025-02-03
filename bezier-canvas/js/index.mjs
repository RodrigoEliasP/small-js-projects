import { configs, flags } from "./modules/configs.mjs"
import { drawBernsteinVectors } from "./modules/drawBernsteinVectors.mjs";
import { drawIndicator } from "./modules/drawIndicator.mjs";
import { calculateCubicBezierCurvePoint, calculateDistanceBetweenPoints, drawLine, lerp } from "./modules/math.mjs";
import { SceneController } from "./modules/SceneController.mjs";
import { drawPoint, makeLogValueOnce } from "./modules/utils.mjs";
/**
 * @type HTMLCanvasElement
 */
const mainCanvas = document.querySelector('#main-canvas');
/**
 * @type HTMLCanvasElement
 */
const graphingCanvas = document.querySelector('#graphing-canvas');


const mainCtx = mainCanvas.getContext('2d');
const graphingCtx = graphingCanvas.getContext('2d');

if(!mainCtx || !graphingCtx) {
    alert('this browser does not support canvas');
}

mainCtx.translate(mainCanvas.width/2, mainCanvas.height/2);



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
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
function clearCanvas(ctx, canvas) {
    ctx.fillStyle = '#dedede';
    const transform = ctx.getTransform();
    const { m41, m42 } = transform;
    ctx.fillRect(-m41, -m42, canvas.width, canvas.height)
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


const pointA = { x: 0, y: -100, label: 'A', color: 'red' };
const pointB = { x: -100, y: 0, label: 'B', color: 'green'};
const pointC = { x: 0, y: 100, label: 'C', color: 'yellow' };
const pointD = { x: 100, y: 0, label: 'D', color: 'purple' };



let mousePoint = {};
let graphingCanvasMousePoint = {};

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {MouseEvent} e 
 * @returns 
 */
const getActualMousePlacement = (canvas, ctx, e) => {
    let rect = canvas.getBoundingClientRect();
    const matrix = ctx.getTransform();
    const padding = -8;
    const { clientX: canvasX, clientY: canvasY } = e;
    const [ actualX, actualY ] = [canvasX - rect.left  - matrix.e - padding, canvasY - rect.top - matrix.f - padding];
    return { x: actualX, y: actualY };
}


const allPointsArray = [pointA, pointB, pointC, pointD];
const allPointsObject = { pointA, pointB, pointC, pointD };

/**
 * 
 * @param {CartesianLocatable[]} points 
 * @param {CartesianLocatable} place 
 */
function findPointColiding(points, place) {
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const distance = calculateDistanceBetweenPoints(place, point);
        if (distance > 20) {
            continue;
        }
        return point;
    }
    return undefined;
}
let draggingPoint = undefined;

mainCanvas.addEventListener('mousemove', (e)  => {
    const actualPlacement = getActualMousePlacement(mainCanvas, mainCtx, e);
    mousePoint.x = actualPlacement.x - 9;
    mousePoint.y = actualPlacement.y - 9;

    if (draggingPoint) {
        draggingPoint.x = mousePoint.x;
        draggingPoint.y = mousePoint.y;
    }
    
})

mainCanvas.addEventListener('mousedown', (e) => {
    const placement = getActualMousePlacement(mainCanvas, mainCtx, e);

    let pointColiding = findPointColiding(allPointsArray, placement);

    
    if(pointColiding) {
        draggingPoint = pointColiding;
    }
});

mainCanvas.addEventListener('mouseup', (e) => {
    draggingPoint = undefined;
});

graphingCanvas.addEventListener('mousemove', (e)  => {
    const actualPlacement = getActualMousePlacement(graphingCanvas, graphingCtx, e);
    graphingCanvasMousePoint.x = actualPlacement.x - 9;
    graphingCanvasMousePoint.y = actualPlacement.y - 9;
    
})

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
            drawPoint(mainCtx, p, [3,4].includes(i) ? { color: 'purple' } : undefined)
        })
    }

    const ABCDInterpolatedPoint_3 = drawInterpolatedPoint(
        mainCtx, 
        ABCInterpolatedPoint_2, 
        ABDInterpolatedPoint_2, 
        t, {
            color: 'cyan'
        }
    );
    
    if(flags.showLines) {

        drawLine(mainCtx, ABInterpolatedPoint_1, BCInterpolatedPoint_1);
        drawLine(mainCtx, BCInterpolatedPoint_1, CDInterpolatedPoint_1);
        drawLine(mainCtx, ABCInterpolatedPoint_2, ABDInterpolatedPoint_2);
    }
}

function drawCubicBezierCurve(t) {
    const pointToDraw = calculateCubicBezierCurvePoint(pointA, pointB, pointC, pointD, t);
    drawPoint(mainCtx, pointToDraw, { color: 'blue' });
}

function drawBezierCurve() {
    if(!flags.showCurvePath) {
        return
    }
    mainCtx.fillStyle = 'black'; 
    mainCtx.moveTo(pointA.x, pointA.y);
    mainCtx.bezierCurveTo(pointB.x, pointB.y, pointC.x, pointC.y, pointD.x, pointD.y)
    mainCtx.stroke();
}

/**
 * 
 * @param {number} t 
 * @param {SceneController} animationController 
 */
function draw(t, animationController) {
    clearCanvas(mainCtx, mainCanvas);
    if(flags.showBernstein) {
        graphingCanvas.hidden = false;
        clearCanvas(graphingCtx, graphingCanvas);
    } else {
        graphingCanvas.hidden = true;
    }
    

    
    if (flags.showAxis) {
        drawAxisLines(mainCtx);
    }

    drawIndicator(mainCtx, mousePoint);
    drawIndicator(graphingCtx, graphingCanvasMousePoint);

    if(flags.showBernstein) {
        drawBernsteinVectors(mainCtx, { ctx: graphingCtx, canvas: graphingCanvas }, { t, allPointsArray, allPointsObject, animationController });
    }

    if(flags.showLines) {
        drawLine(mainCtx, pointA, pointB);
        drawLine(mainCtx, pointB, pointC);
        drawLine(mainCtx, pointC, pointD);
    }

    drawBezierCurve();

    drawCubicBezierCurvePointDeCasteljau(t);
    //drawCubicBezierCurvePointSingleFunction(t);
    allPointsArray.forEach(point => {
        drawPoint(mainCtx, point, { label: flags.showLabels && point.label });
    })
}

const animationController = new SceneController(configs);

function main() {

    const t = animationController.getAnimationDisplacement(configs.animation.type);
    
    requestAnimationFrame(() => draw(t, animationController))
}
setInterval(main, 5)

