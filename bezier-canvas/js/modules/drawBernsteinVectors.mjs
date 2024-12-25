import { calculatePoints } from "./math.mjs";
import { drawLine } from "./math.mjs";
import { calculateCubicBezierCurvePoint } from "./math.mjs";
import { getTheClosestPointToNPoints } from "./math.mjs";
import { MathFunctionStore } from "./MathFunctionStore.mjs";
import { SceneController } from "./SceneController.mjs";
import { drawPoint } from "./utils.mjs";

/**
 * @typedef {import("../index.mjs").CartesianLocatable} CartesianLocatable
 * @typedef { import("../index.mjs").ColorizedCartesianLocatable } ColorizedCartesianLocatable
 */

let lastCacheId = '';

const cache = new MathFunctionStore();

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {{ ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement }} graphingCtx 
 * @param { { t: number;  allPointsArray: ColorizedCartesianLocatable[]; allPointsObject: { [x in `point${'A'|'B'|'C'|'D'}`]: ColorizedCartesianLocatable }; animationController: SceneController } }
*/
export function drawBernsteinVectors(ctx, { ctx: graphingCtx, canvas: graphingCanvas }, { t, allPointsObject, allPointsArray , animationController }) {
    const closestPoint = getTheClosestPointToNPoints(...allPointsArray);
    const range = animationController.getRangesForConfiguration();
    if(lastCacheId !== JSON.stringify({...allPointsObject, ...range})) {
        cache.setConfigs((a,b,c,d, value) => {
            console.log(value);
            return calculateCubicBezierCurvePoint(
                calculatePoints(a, closestPoint, 'sub'), 
                calculatePoints(b, closestPoint, 'sub'), 
                calculatePoints(c, closestPoint, 'sub'), 
                calculatePoints(d, closestPoint, 'sub'),
            value);
        }, allPointsArray, range);
        cache.generateResults();
    };
    const points = cache.retrieveAllResults();

    for (const [t, dataset] of points) {
        const scaledT = t * graphingCanvas.width - graphingCanvas.width / 2;
        Object.entries(dataset.monomialSum).forEach(([pointLabel, point]) => {
            const originPoint = allPointsObject['point' + pointLabel.toUpperCase()];
            const plotPoint = calculatePoints(
                calculatePoints(point, calculatePoints(originPoint, closestPoint), 'div'),
                { x: -graphingCanvas.height/5, y: -graphingCanvas.height/5 }, 
                "mult"
            );
            
            drawPoint(graphingCtx, { x: scaledT, y: plotPoint.y + plotPoint. x, color: originPoint.color }, { radius: 1, showLocation: t === 100  })
        }) 
    }


    drawPoint(ctx, closestPoint, { radius: 3, color: 'lime' });
    let lastPoint = closestPoint
    for (const point of allPointsArray ) {
        const pointLabel = point.label.toLowerCase();
        
        const target = cache.retrieveResult(t).monomialSum[pointLabel]

        const endPoint = calculatePoints(target, lastPoint);
        drawLine(ctx, lastPoint, endPoint, { color: point.color })

        lastPoint = endPoint
        

    }
    ctx.strokeStyle = 'black'
    

}