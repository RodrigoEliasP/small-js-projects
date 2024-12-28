import { calculatePoints } from "./math.mjs";
import { drawLine } from "./math.mjs";
import { calculateCubicBezierCurvePoint } from "./math.mjs";
import { getTheClosestPointToNPoints } from "./math.mjs";
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
    const closestPoint = getTheClosestPointToNPoints(...allPointsArray);
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
            calculatePoints(a, closestPoint, 'sub'), 
            calculatePoints(b, closestPoint, 'sub'), 
            calculatePoints(c, closestPoint, 'sub'), 
            calculatePoints(d, closestPoint, 'sub'),
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
    for (const [t, dataset] of points) {
        const scaledT = t * graphingCanvas.width - graphingCanvas.width / 2;
        if (lastSums.state === 'empty') {
            lastSums = { state: 'filled', ...dataset.monomialSum, lastScaledT: scaledT };
            continue;
        }
        Object.entries(dataset.monomialSum).forEach(([pointLabel, point]) => {
            const originPoint = allPointsObject['point' + pointLabel.toUpperCase()];
            const lastPoint = lastSums[pointLabel]
            
            const lastWeightedSumPoints = getWeightedSumPoint(originPoint, closestPoint, lastPoint, graphingCanvas);
            const weightedSumPoint = getWeightedSumPoint(originPoint, closestPoint, point, graphingCanvas);
            
            logOnce(lastWeightedSumPoints, weightedSumPoint);

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
        const endPoint = calculatePoints(target, lastPoint);
        drawLine(ctx, lastPoint, endPoint, { color: point.color });
        lastPoint = endPoint;
    }
    ctx.strokeStyle = 'black'
    

}

function getWeightedSumPoint(originPoint, closestPoint, point, graphingCanvas) {
    const pointWithOffset = calculatePoints(originPoint, closestPoint);
    const weightedSumRatio = calculatePoints(point, pointWithOffset, 'div', { divisionByZeroValue: 0.001 });
    const scaledPoint = calculatePoints(
        weightedSumRatio,
        { x: graphingCanvas.height/2, y: graphingCanvas.height/2 },
        "mult"
    );
    return { x: Math.abs(scaledPoint.x), y: Math.abs(scaledPoint.y) };
}
