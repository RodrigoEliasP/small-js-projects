import { calculatePoints } from "./math.mjs";
import { drawLine } from "./math.mjs";
import { calculateCubicBezierCurvePoint } from "./math.mjs";
import { getTheClosestPointToNPoints } from "./math.mjs";
import { drawPoint } from "./utils.mjs";

/**
 * @typedef {import("../index.mjs").CartesianLocatable} CartesianLocatable
 * @typedef { import("../index.mjs").ColorizedCartesianLocatable } ColorizedCartesianLocatable
 */

let lastCacheId = '';
/**
 * @type { Map<string, ReturnType<calculateCubicBezierCurvePoint> }
 */
const allPoints = new Map();

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {{ ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement }} graphingCtx 
 * @param { { t: number;  allPointsArray: ColorizedCartesianLocatable[]; allPointsObject: { [x in `point${'A'|'B'|'C'|'D'}`]: ColorizedCartesianLocatable }; precision: number } }
*/
export function drawBernsteinVectors(ctx, { ctx: graphingCtx, canvas: graphingCanvas }, { t, allPointsArray, allPointsObject, precision = 900 }) {
    const { pointA, pointB, pointC, pointD } = allPointsObject;
    const closestPoint = getTheClosestPointToNPoints(...allPointsArray);
    if(lastCacheId !== JSON.stringify(allPointsObject)) {
        lastCacheId = JSON.stringify(allPointsObject);
        for (let i = 0; i < precision; i++) {
            const value = i / precision;
            allPoints.set(
                value.toString(), 
                calculateCubicBezierCurvePoint(
                    calculatePoints(pointA, closestPoint, 'sub'), 
                    calculatePoints(pointB, closestPoint, 'sub'), 
                    calculatePoints(pointC, closestPoint, 'sub'), 
                    calculatePoints(pointD, closestPoint, 'sub'),
                value)
            );
        }
    };
    const points = allPoints.get(t.toString());

    for (const [t, dataset] of allPoints.entries()) {
        const scaledT = t * graphingCanvas.width - graphingCanvas.width / 2;
        Object.entries(dataset.monomialSum).forEach(([pointLabel, point]) => {
            const originPoint = allPointsObject['point' + pointLabel.toUpperCase()];
            const plotPoint = calculatePoints(
                calculatePoints(point, calculatePoints(originPoint, closestPoint), 'div'),
                { x: -graphingCanvas.height/5, y: -graphingCanvas.height/5 }, 
                "mult"
            );
            
            drawPoint(graphingCtx, { x: scaledT, y: plotPoint.y + plotPoint. x, color: originPoint.color }, { radius: 1 })
        }) 
    }


    drawPoint(ctx, closestPoint, { radius: 3, color: 'lime' });
    let lastPoint = closestPoint
    for (const point of allPointsArray ) {
        const pointLabel = point.label.toLowerCase();
        
        const target = points.monomialSum[pointLabel]

        const endPoint = calculatePoints(target, lastPoint);
        drawLine(ctx, lastPoint, endPoint, { color: point.color })

        lastPoint = endPoint
        

    }
    ctx.strokeStyle = 'black'
    

}