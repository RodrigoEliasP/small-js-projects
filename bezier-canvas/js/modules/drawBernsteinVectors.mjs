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

const cache = new MathFunctionStore();

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

    const scaledT = t * graphingCanvas.width - graphingCanvas.width / 2;
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
        absoluteSum: undefined,
        dataset: { 
            x: undefined, 
            y: undefined, 

            monomialSum: {
                a: undefined, 
                b: undefined, 
                c: undefined, 
                d: undefined,
            } 
        },
        lastScaledT: undefined,
    };
    for (const [innerT, dataset] of points) {
        const scaledT = innerT * graphingCanvas.width - graphingCanvas.width / 2;
        const absoluteSum = Object.values(dataset.monomialSum).reduce((acc,cur) => {
            acc.x += Math.abs(cur.x);
            acc.y += Math.abs(cur.y);
            return acc;
        }, { x: 0, y: 0 });
        if (lastSums.state === 'empty') {
            lastSums = { state: 'filled', dataset, lastScaledT: scaledT, absoluteSum };
            continue;
        }
        Object.entries(dataset.monomialSum).forEach(([pointLabel, point]) => {
            const originPoint = allPointsObject['point' + pointLabel.toUpperCase()];
            const lastPoint = lastSums.dataset.monomialSum[pointLabel];
            
            const lastWeightedSumPoints = getWeightedSumPoint(lastPoint, lastSums.absoluteSum, graphingCanvas);
            const weightedSumPoint = getWeightedSumPoint(point, absoluteSum, graphingCanvas);
            const firstPoint = { 
                x: lastSums.lastScaledT, 
                y: -Math.abs((lastWeightedSumPoints.y + lastWeightedSumPoints.x) * graphingCanvas.height),
            }
            const endPoint = { 
                x: scaledT, 
                y: -Math.abs(weightedSumPoint.y + weightedSumPoint.x) * graphingCanvas.height,
            }
            drawLine(
                graphingCtx, 
                firstPoint,
                endPoint,
                {
                    color: originPoint.color 
                }
            );
        }) 
        lastSums = { state: 'filled', dataset, lastScaledT: scaledT, absoluteSum };
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

function getWeightedSumPoint(summedPoint, point, graphingCanvas) {
    const absoluteSummedPoint = { x: Math.abs(summedPoint.x), y: Math.abs(summedPoint.y)};
    const absolutePoint = { x: Math.abs(point.x), y: Math.abs(point.y)};
    const weightedSumRatio = operateOnPoints(operateOnPoints(absoluteSummedPoint, 100, "mult"), absolutePoint, 'div', { divisionByZeroValue: 'ignore' });
    const scaledPoint = operateOnPoints(
        { ...weightedSumRatio },
        { x: graphingCanvas.height, y: graphingCanvas.height },
        "div"
    );
    return { x: Math.abs(scaledPoint.x), y: Math.abs(scaledPoint.y) };
}
