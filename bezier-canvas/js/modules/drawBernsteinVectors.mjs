import { calculateDistanceBetweenPoints, operateOnPoints } from "./math.mjs";
import { drawLine } from "./math.mjs";
import { calculateCubicBezierCurvePoint } from "./math.mjs";
import { calculateTheClosestPointToNPoints } from "./math.mjs";
import { MathFunctionStore } from "./MathFunctionStore.mjs";
import { SceneController } from "./SceneController.mjs";
import { drawPoint, makeLogValueOnce } from "./utils.mjs";

/**
 * @typedef {import("../index.mjs").CartesianLocatable} CartesianLocatable
 * @typedef { import("../index.mjs").ColorizedCartesianLocatable } ColorizedCartesianLocatable
 */

let lastCacheId = '';

const cache = new MathFunctionStore();

const logOnce = makeLogValueOnce({ mode: 'cached' });

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {{ ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement }} graphingCtx 
 * @param { { t: number;  allPointsArray: ColorizedCartesianLocatable[]; allPointsObject: { [x in `point${'A'|'B'|'C'|'D'}`]: ColorizedCartesianLocatable }; animationController: SceneController } }
*/
export function drawBernsteinVectors(ctx, { ctx: graphingCtx, canvas: graphingCanvas }, { t, allPointsObject, allPointsArray , animationController }) {
    graphingCtx.setTransform(1,0,0, 1, graphingCanvas.width/2, graphingCanvas.height);
    const closestPoint = calculateTheClosestPointToNPoints(...allPointsArray);
    const range = animationController.getRangesForConfiguration();

    const scaledT = t * graphingCanvas.width - graphingCanvas.width / 2
    
    drawLine(
        graphingCtx, 
        { x: scaledT, y: graphingCanvas.height/2 },
        { x: scaledT, y: -graphingCanvas.height },
        { color: 'white', lineWidth: 10 }
    );
    cache.setConfigs({ fn: (a,b,c,d, value) => {
        return calculateCubicBezierCurvePoint(
            operateOnPoints(a, closestPoint, 'sub'), 
            operateOnPoints(b, closestPoint, 'sub'), 
            operateOnPoints(c, closestPoint, 'sub'), 
            operateOnPoints(d, closestPoint, 'sub'),
        value);
    }, params: allPointsArray }, range);

    const points = cache.retrieveAllResults();

    let lastSums = {
        state: 'empty',
        a: undefined,
        b: undefined,
        c: undefined,
        d: undefined,
        lastScaledT: undefined,
    };
    for (const [innerT, dataset] of points) {
        const scaledT = innerT * graphingCanvas.width - graphingCanvas.width / 2;
        if (lastSums.state === 'empty') {
            lastSums = { state: 'filled', ...dataset.monomialSum, lastScaledT: scaledT };
            continue;
        }
        Object.entries(dataset.monomialSum).forEach(([pointLabel, point]) => {
            const originPoint = allPointsObject['point' + pointLabel.toUpperCase()];
            const lastPoint = lastSums[pointLabel]
            
            const lastWeightedSumPoints = getWeightedSumPoint(originPoint, closestPoint, lastPoint, graphingCanvas);
            const weightedSumPoint = getWeightedSumPoint(originPoint, closestPoint, point, graphingCanvas, t === innerT && 'D');

            drawLine(
                graphingCtx, 
                { 
                    x: lastSums.lastScaledT, 
                    y: -Math.abs(lastWeightedSumPoints.y + lastWeightedSumPoints.x),
                },
                { 
                    x: scaledT, 
                    y: -Math.abs(weightedSumPoint.y + weightedSumPoint.x),
                },
                {
                    color: originPoint.color 
                }
            );
        }) 
        lastSums = { state: 'filled', ...dataset.monomialSum, lastScaledT: scaledT };
    }
    drawPoint(ctx, closestPoint, { radius: 3, color: 'lime' });
    let lastPoint = closestPoint
    for (const point of allPointsArray ) {
        const pointLabel = point.label.toLowerCase();
        const target = cache.retrieveResult(t).monomialSum[pointLabel];
        const endPoint = operateOnPoints(target, lastPoint);
        drawLine(ctx, lastPoint, endPoint, { color: point.color });
        lastPoint = endPoint;
    }
    ctx.strokeStyle = 'black'
    

}

function getWeightedSumPoint(originPoint, closestPoint, point, graphingCanvas, debug) {
    const originPointWithOffset = operateOnPoints(originPoint, closestPoint);
    const weightedSumRatio = operateOnPoints(point, originPointWithOffset, 'div', { divisionByZeroValue: 0.001 });
    if( originPoint.label === debug ) {
        logOnce(originPoint, closestPoint, point, originPointWithOffset, weightedSumRatio)
    }
    const scaledPoint = operateOnPoints(
        { x: weightedSumRatio },
        { x: graphingCanvas.height, y: graphingCanvas.height },
        "mult"
    );
    return { x: Math.abs(scaledPoint.x), y: Math.abs(scaledPoint.y) };
}
