let throttle = function (fn, delay) {
    let timer = null;
    return function (...rest) {
        if (!timer) {
            timer = setTimeout(() => { timer = null; }, delay);
            fn.apply(null, rest);
        }
    };
};

let EventUtil = {
    getEvent (event) {
        return event || window.event;
    },
    getTarget (event) {
        return event.target || event.srcElement;
    },
    addHandler (el, type, fn) {
        if (document.addEventListener) {
            el.addEventListener(type, fn, false);
        } else if (document.attachEvent) {
            el.attachEvent('on' + type, fn);
        } else {
            el['on' + type] = fn;
        }
    },
    removeHandler (el, type, fn) {
        if (document.removeEventListener) {
            el.removeEventListener(type, fn);
        } else if (document.detachEvent) {
            el.detachEvent('on' + type, fn);
        } else {
            el['on' + type] = null;
        }
    }
};

let storage = {
    get (key) {
        return localStorage.getItem('zzr_' + key);
    },
    set (ket, value) {
        localStorage.setItem('zzr_' + key, value);
    }
};

export {throttle, EventUtil, storage};
