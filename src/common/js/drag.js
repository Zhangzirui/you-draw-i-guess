import {throttle,
        EventUtil} from './util.js';

/*
* Drag 拖动组件
* 可自定义拖动范围
* gte IE9
* */

class Drag {
    constructor (el) {
        this.el = document.querySelector(el);
        this.isSupportTouch = 'ontouchend' in document;
        this.begin = false;
        this.startX = null;
        this.startY = null;
        this.moveX = null;
        this.moveY = null;
    }

    init (range, callback) {
        // range [Object] 是 el可以被拖动的范围
        // range {left: , right: , top: , bottom:}
        if (range) {
            this.range = range;
        }

        if (callback) {
            this.draging = callback;
        }

        this.bind();
    }

    bind () {
        let self = this,
            pageX,
            pageY;

        function moveStart (event) {
            let e = EventUtil.getEvent(event),
                target = EventUtil.getTarget(e);
            if (target === self.el) {
                self.begin = true;
            }

            if (self.startX !== null && self.startY !== null) {
                return;
            }

            if (self.isSupportTouch) {
                pageX = e.touches[0].pageX;
                pageY = e.touches[0].pageY;
            } else {
                pageX = e.pageX;
                pageY = e.pageY;
            }
            self.startX = pageX;
            self.startY = pageY;
        }

        function move (event) {
            if (!self.begin) {
                return;
            }
            let e = EventUtil.getEvent(event);

            if (self.isSupportTouch) {
                pageX = e.touches[0].pageX;
                pageY = e.touches[0].pageY;
            } else {
                pageX = e.pageX;
                pageY = e.pageY;
            }

            self.moveX = pageX - self.startX;
            self.moveY = pageY - self.startY;

            if (self.range) {
                if (typeof self.range.left === 'number') {
                    self.moveX = self.range.left > self.moveX ? self.range.left : self.moveX;
                }
                if (typeof self.range.right === 'number') {
                    self.moveX = self.range.right < self.moveX ? self.range.right : self.moveX;
                }
                if (typeof self.range.top === 'number') {
                    self.moveY = self.range.top > self.moveY ? self.range.top : self.moveY;
                }
                if (typeof self.range.bottom === 'number') {
                    self.moveY = self.range.bottom < self.moveY ? self.range.bottom : self.moveY;
                }
            }

            if (typeof self.draging === 'function') {
                self.draging();
            }

            self.el.style.transform = `translate(${self.moveX}px, ${self.moveY}px)`;
        }

        let _move = throttle(move, 50);

        function moveEnd (event) {
            self.begin = false;
        }

        if (self.isSupportTouch) {
            EventUtil.addHandler(document, 'touchstart', moveStart);
            EventUtil.addHandler(document, 'touchmove', _move);
            EventUtil.addHandler(document, 'touchend', moveEnd);
        } else {
            EventUtil.addHandler(document, 'mousedown', moveStart);
            EventUtil.addHandler(document, 'mousemove', _move);
            EventUtil.addHandler(document, 'mouseup', moveEnd);
        }

        this.unbind = function () {
            if (self.isSupportTouch) {
                document.removeEventListener('touchstart', moveStart);
                document.removeEventListener('touchmove', _move);
            } else {
                document.removeEventListener('mousedown', moveStart);
                document.removeEventListener('mousemove', _move);
            }
        };
    }

    getDistance () {
        return {
            disX: this.moveX,
            disY: this.moveY
        };
    }
}

export default Drag;
