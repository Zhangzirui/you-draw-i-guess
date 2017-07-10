let dateNow = (function () {
    if (typeof performance !== 'undefined') {
        return () => window.performance.now();
    } else {
        return () => Date.now() || (new Date()).getTime();
    }
})();

let getRequestAnimationFrame = (function () {
    if (typeof requestAnimationFrame !== 'undefined') {
        return () => window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.msRequestAnimationFrame;
    } else {
        return (fn) => setTimeout(() => fn.call(this, dateNow()), 1000 / 60);
    }
})();

let getCancelAnimationFrame = (function () {
    if (typeof cancelAnimationFrame !== 'undefined') {
        return () => window.cancelAnimationFrame ||
                    window.webkitCancelAnimationFrame ||
                    window.mozCancelAnimationFrame ||
                    window.msCancelAnimationFrame;
    } else {
        return id => clearTimeout(id);
    }
})();

class Animate {
    constructor (update, duration, easing) {
        this.update = update;
        this.duration = duration;
        this.easing = easing || function (p) { return p; };
    }

    animate () {
        let requestAnimationFrame = getRequestAnimationFrame(),
            cancelAnimationFrame = getCancelAnimationFrame();
        let duration = this.duration,
            update = this.update,
            easing = this.easing,
            self = this;
        return new Promise(function (resolve, reject) {
            let startTime = dateNow();
            let animateId = null;
            let step = function () {
                let p = (dateNow() - startTime) / duration;
                update.call(self, easing(p), p);
                if (p <= 1) {
                    animateId = requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };
            self.cancel = function () {
                update.call(self, 0, 0);
                cancelAnimationFrame(animateId);
                reject('you cancel this animation');
            };
            animateId = requestAnimationFrame(step);
        });
    }

    ease (easing) {
        return new Animate(this.update, this.duration, easing);
    }
}

export {Animate, dateNow};
