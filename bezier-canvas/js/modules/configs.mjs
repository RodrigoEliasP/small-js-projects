export const configs = {
    flags: {    
        showIntermediatePoints: true,
        showIntermediateLines: true,
        showPrimaryLines: true,
        showAxis: true,
        showCoordinates: true,
        showPointerIndicator: false,
    }
};

/**
 * 
 * @param {keyof typeof configs} key 
 */
export function toggleConfig(key) {
    configs.flags[key] = !configs.flags[key];
    console.log(configs);
}

Object.keys(configs.flags).forEach(key => {

    const el = document.querySelector(`#${key}`);
    el.checked = configs.flags[key];
    el.addEventListener('click', ()=>  toggleConfig(key))
})
