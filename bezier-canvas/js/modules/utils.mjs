import { flags } from "./configs.mjs";

/**
 * @typedef { import("../index.mjs").CartesianLocatable } CartesianLocatable
 * @typedef { import("../index.mjs").ColorizedCartesianLocatable } ColorizedCartesianLocatable
 * @typedef { import("../index.mjs").DrawPointsConfigs } DrawPointsConfigs
 */

/**
* @param {CanvasRenderingContext2D} ctx 
* @param {CartesianLocatable | ColorizedCartesianLocatable} place
* @param {number} radius
* @param {DrawPointsConfigs} options
*/
export const drawPoint = (ctx, place, options) => {
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
   ctx.strokeStyle = color;
   ctx.fillStyle = color;
   ctx.beginPath();
   ctx.arc(place.x, place.y, radius, 0, 2 * Math.PI);
   ctx.fill();
   ctx.stroke();
}
/**
 * 
 * @param {{ mode: 'single' | 'cached'}} options single will log values that does not changes, cached will log a set of values that doesn't change
 * @returns 
 */
export const makeLogValueOnce = ({mode} = { mode: 'single' }) => {
    const valuesIds = new Set();
    return (...values) => {
        const id = JSON.stringify(values);
        if(valuesIds.has(id)) {
            return;
        } else {
            if(mode === 'single') {
                valuesIds.clear();
            }

            valuesIds.add(JSON.stringify(values));
            console.log(values);
        }
    }
}