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
    /**
     * @type {{ type: 'man', displacement: number; } | { type: 'auto', speed: number; }}
     */
    animation: {
        type: 'auto',
        speed: 1
    }
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
const rangeInput = document.querySelector("#animationRange");

const rangeValue = document.querySelector("#animationRange");

/**
 * 
 * @param {'man' | 'auto'} mode 
 */
function setAnimationMode(mode) {
    const values = {
        auto: {
            defaultValue: 1,
            stepSize: 0.25,
            handler: () => {
                rangeValue.textContent = Number(rangeInput.value).toFixed(2);
                configs.animation.speed = rangeInput.value;
            }
        }, 
        man: {
            defaultValue: 0,
            stepSize: 0.01,
            handler: () => {
                rangeValue.textContent = Number(rangeInput.value).toFixed(2);
                configs.animation.displacement = rangeInput.value;
            }
        }
    }
    const { defaultValue, handler, stepSize } = values[mode];
    rangeInput.value = defaultValue;
    rangeInput.step = stepSize;
    rangeValue.innerHTML = (defaultValue).toFixed(2);
    configs.animation.type = mode;
    rangeInput.addEventListener('input', handler);
}

/**
 * @type {HTMLSelectElement}
 */
const animationMode = document.querySelector("#animationMode");
animationMode.addEventListener('change', (e) => {
    setAnimationMode(e.target.value);
})

Object.keys(configs.flags).forEach(key => {

    const el = document.querySelector(`#${key}`);
    el.checked = configs.flags[key];
    el.addEventListener('click', ()=>  toggleConfig(key))
})
