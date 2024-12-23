import { flags } from "./configs.mjs";

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

export const makeLogValueOnce = () => {

    let valueId;
    return (value) => {
        if(valueId === JSON.stringify(value)) {
            return;
        } else {
            valueId = JSON.stringify(value);
            console.log(value);
        }
    }
}