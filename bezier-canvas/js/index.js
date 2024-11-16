/**
 * @type HTMLCanvasElement
 */
const canvas = document.querySelector('#canvas');

const ctx = canvas.getContext('2d');

const animationMs = 5;


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
 */
function drawPoint(ctx, place , radius = 5) {
    const { x, y } =  place;
    ctx.fillText(`(${x.toFixed(2)},${y.toFixed(2)})`, x - radius * 2.3, y - 10);
    ctx.beginPath();
    ctx.arc(place.x, place.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "black"
    ctx.fill();
    ctx.stroke();
}

/**
 * @param {CanvasRenderingContext2D} ctx 
 * @param {CartesianLocatable} a
 * @param {CartesianLocatable} b
 * @param {CartesianLocatable} t
 * @returns {CartesianLocatable} 
 * 
 */
function drawInterpolatedPoint(ctx, a, b, t) {
    const interpolatedX = lerp(a.x, b.x, t);
    const interpolatedY = lerp(a.y, b.y, t);
    drawPoint(ctx, { x: interpolatedX, y: interpolatedY });
    return { x: interpolatedX, y: interpolatedY }
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

if(!ctx) {
    alert('this browser does not support canvas');
}

ctx.translate(canvas.width/2, canvas.height/2);

const pointA = { x: -100, y: 0 };
const pointB = { x: 0, y: 100 };
const pointC = { x: 100, y: 0 };


function draw(t) {
    clearCanvas(ctx);
    drawPoint(ctx, pointA);
    
    drawPoint(ctx, pointB);
    drawPoint(ctx, pointC);

    
    const firstInterpolatedPoint = drawInterpolatedPoint(ctx, pointA, pointB, t);
    const secondInterpolatedPoint = drawInterpolatedPoint(ctx, pointB, pointC, t);
    const thirdInterpolatePoint = drawInterpolatedPoint(ctx, firstInterpolatedPoint, secondInterpolatedPoint, t);
    drawLine(ctx, firstInterpolatedPoint, secondInterpolatedPoint);
    drawLine(ctx, pointA, pointB);
    drawLine(ctx, pointB, pointC);

    

}
let range = 0;
let going = true;
let step = 1;
setInterval(() => {
    debugger;
    range = range + (step * (going ? 1 : -1) );
    if(going) {
        going = range !== 100;
    } else {
        going = range === 0;
    }
    requestAnimationFrame(() => draw(range/100))
}, animationMs)
