/**
 * @type HTMLCanvasElement
 */
const canvas = document.querySelector('#canvas');

const ctx = canvas.getContext('2d');

const animationMs = 10;


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
    const { color = "black", showLocation = true} = options ?? {};
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
    ctx.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height)
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * 
 */
function drawAxisLines(ctx) {
    const { width, height } = canvas;
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

ctx.translate(canvas.width/2, canvas.height/2);

const pointA = { x: 0, y: -100 };
const pointB = { x: -100, y: 0 };
const pointC = { x: 0, y: 100 };
const pointD = { x: 100, y: 0 };



let mousePoint = {};

const getActualMousePlacement = (e) => {
    const { width, height } = canvas;
    const { clientX, clientY } = e;
    const [ actualX, actualY ] = [clientX - (width / 2), clientY - (height / 2)];
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

canvas.addEventListener('mousemove', (e)  => {
    const actualPlacement = getActualMousePlacement(e);
    mousePoint.x = actualPlacement.x - 9;
    mousePoint.y = actualPlacement.y - 9;

    if (draggingPoint) {
        draggingPoint.x = mousePoint.x;
        draggingPoint.y = mousePoint.y;
    }
    
})

canvas.addEventListener('mousedown', (e) => {
    const placement = getActualMousePlacement(e);

    let pointColiding = findPointColiding(allPoints, placement);

    
    if(pointColiding) {
        draggingPoint = pointColiding;
    }
});

canvas.addEventListener('mouseup', (e) => {
    draggingPoint = undefined;
});


const configs = {
    hideIntermediatePoints: false,
    hideIntermediateLines: true,
    hidePrimaryLines: true,
    hideAxis: true,
}

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

    if(!configs.hideIntermediatePoints) {
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
    
    if(!configs.hideIntermediateLines) {

        drawLine(ctx, ABInterpolatedPoint_1, BCInterpolatedPoint_1);
        drawLine(ctx, ABInterpolatedPoint_1, ADInterpolatedPoint_1);
        drawLine(ctx, ABCInterpolatedPoint_2, ABDInterpolatedPoint_2);
    }
}

function drawCubicBezierCurvePointSingleFunction(t) {

}


function draw(t) {
    clearCanvas(ctx);
    
    if (!configs.hideAxis) {
        drawAxisLines(ctx);
    }

    if(mousePoint.x) {
        drawPoint(ctx, mousePoint, 3, { color: 'red', showLocation: false  })
    }

    drawPoint(ctx, pointB);
    drawPoint(ctx, pointC);
    drawPoint(ctx, pointD);
    drawPoint(ctx, pointA);


    drawCubicBezierCurvePointDeCasteljau(t);

    if(!configs.hidePrimaryLines) {
        drawLine(ctx, pointB, pointC);
        drawLine(ctx, pointC, pointD);
        drawLine(ctx, pointB, pointA);
    }

    ctx.fillStyle = 'black'; 
    ctx.moveTo(pointA.x, pointA.y);
    ctx.bezierCurveTo(pointB.x, pointB.y, pointC.x, pointC.y, pointD.x, pointD.y)
    ctx.stroke();

    

}
let range = 0;
let going = true;
let step = 1;
setInterval(() => {
    range = range + (step * (going ? 1 : -1) );
    if(going) {
        going = range !== 100;
    } else {
        going = range === 0;
    }
    requestAnimationFrame(() => draw(range/100))
}, animationMs)
