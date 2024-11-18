export const configs = {
    flags: {    
        showIntermediatePoints: false,
        showIntermediateLines: false,
        showPrimaryLines: false,
        showAxis: false,
        showCoordinates: false,
        showPointerIndicator: false,
        showCurvePath: true,
    },
    animationSpeed: 1
};

/**
 * 
 * @param {keyof typeof configs} key 
 */
export function toggleConfig(key) {
    configs.flags[key] = !configs.flags[key];
}

/**
 * @type {HTMLInputElement}
 */
const rangeInput = document.querySelector("#rangeInput");
rangeInput.value = 1;
const rangeValue = document.querySelector("#rangeValue");
rangeValue.innerHTML = (1).toFixed(2);
rangeInput.addEventListener('input', () => {
    rangeValue.textContent = Number(rangeInput.value).toFixed(2);
    configs.animationSpeed = rangeInput.value;
})
Object.keys(configs.flags).forEach(key => {

    const el = document.querySelector(`#${key}`);
    el.checked = configs.flags[key];
    el.addEventListener('click', ()=>  toggleConfig(key))
})
