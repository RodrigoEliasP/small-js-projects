import { flags } from "./configs.mjs"
import { drawPoint } from "./utils.mjs"

export function drawIndicator(ctx, mousePoint) {
    if(mousePoint.x && flags.showPointerIndicator) {
        drawPoint(ctx, mousePoint, { radius: 3, color: 'red', showLocation: true  })
    }
}