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
const animationRange = document.querySelector("#animationRange");

/**
 * @type {HTMLSpanElement}
 */
const rangeValue = document.querySelector("#rangeValue");
/**
 * @type {HTMLSpanElement}
 */
const rangeUnit = document.querySelector("#rangeUnit");


/**
 * 
 * @param {'man' | 'auto'} mode 
 */
function changeAnimationMode(mode) {
    const values = {
        auto: {
            defaultValue: 1,
            min: 0.25,
            unit: 'X',
            max: 2,
            stepSize: 0.25,
            handler: () => {
                rangeValue.textContent = Number(animationRange.value).toFixed(2);
                configs.animation = { ...configs.animation, speed: animationRange.value };
            }
        }, 
        man: {
            defaultValue: 50,
            unit: '%',
            min: 0,
            max: 100,
            stepSize: 1,
            handler: () => {
                rangeValue.textContent = animationRange.value
                configs.animation = { ...configs.animation, displacement: animationRange.value };
            }
        }
    }
    const { defaultValue, handler, stepSize, min, max, unit } = values[mode];
    animationRange.step = stepSize;
    animationRange.min = min;
    animationRange.max = max;
    animationRange.value = defaultValue;

    rangeUnit.textContent = unit;

    animationMode.value = mode;
    configs.animation.type = mode;
    handler();
    animationRange.addEventListener('input', handler);
}

/**
 * @type {HTMLSelectElement}
 */
const animationMode = document.querySelector("#animationMode");

changeAnimationMode('auto');

animationMode.addEventListener('change', (e) => {
    changeAnimationMode(e.target.value);
})

Object.keys(configs.flags).forEach(key => {

    const el = document.querySelector(`#${key}`);
    el.checked = configs.flags[key];
    el.addEventListener('click', ()=>  toggleConfig(key))
})
