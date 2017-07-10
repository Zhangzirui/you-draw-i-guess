import {throttle} from './util.js';

class DrawCanvas {
    constructor (backEl, frontEl, sizeNode) {
        this.backEl = backEl;
        this.frontEl = frontEl;
        // sizeNode 是用来初始化 el 的大小；
        if (sizeNode !== undefined) {
            this.sizeNodeStyle = sizeNode.getBoundingClientRect();
        } else {
            this.sizeNodeStyle = this.frontEl.getBoundingClientRect();
        }

        this.settingReset();
    }

    settingReset () {
        this.coordinateX = null;
        this.coordinateY = null;
        this.imageUrlList = [];
        this.setting = {
            color: '#000000',
            px: '5'
            // status 0: 笔， 1: 橡皮擦
            // status: 0
        };
    }

    init (drawingFn, endFn) {
        this.context = this.backEl.getContext('2d');
        this.frontContext = this.frontEl.getContext('2d');
        if (!this.context) {
            console.log('您的浏览器不支持Canvas');
            return;
        }
        this.initStyle();
        if (typeof drawingFn === 'function') {
            this.drawingFn = drawingFn;
        }
        if (typeof endFn === 'function') {
            this.endFn = endFn;
        }
        this.bindEvent();
        this.imageUrlList.push(this.getImgUrl(this.backEl));
        console.log(this.imageUrlList.length);
    }

    initStyle () {
        this.backEl.width = this.sizeNodeStyle.width;
        this.backEl.height = this.sizeNodeStyle.height;

        // 第二个canvas图层
        this.frontEl.width = this.backEl.width;
        this.frontEl.height = this.backEl.height;
    }

    bindEvent () {
        let self = this;

        function touchStart (e) {
            console.log('*******start**********');
            e.preventDefault();
            self._getCoordinate(e);
            self.frontContext.beginPath();
            self._initContextStyle();
            self.frontContext.moveTo(self.coordinateX, self.coordinateY);
        }

        function touchMove (e) {
            console.log('*******touchMove**********');
            self._getCoordinate(e);
            self.frontContext.lineTo(self.coordinateX, self.coordinateY);
            self.frontContext.stroke();
            if (self.drawingFn) {
                self.drawingFn();
            }
        }

        function touchEnd (e) {
            self.frontContext.stroke();
            let frontImgUrl = self.getImgUrl(self.frontEl);
            self.drawImg(self.context, frontImgUrl, () => {
                let backImgUrl = self.getImgUrl(self.backEl);
                self.imageUrlList.push(backImgUrl);
            });
            if (typeof self.endFn === 'function') {
                self.endFn();
            }
            self.clear(self.frontContext);
            console.log(self.imageUrlList.length);
        }

        let _touchMove = throttle(touchMove, 100);

        this.frontEl.addEventListener('touchstart', touchStart, false);
        this.frontEl.addEventListener('touchmove', _touchMove, false);
        this.frontEl.addEventListener('touchend', touchEnd, false);

        this.unBindEvent = function () {
            this.frontEl.removeEventListener('touchstart', touchStart);
            this.frontEl.removeEventListener('touchmove', _touchMove);
            this.frontEl.removeEventListener('touchend', touchEnd);
        };
    }

    clear (context) {
        if (context) {
            context.clearRect(0, 0, this.backEl.width, this.backEl.height);
        } else {
            this.context.clearRect(0, 0, this.backEl.width, this.backEl.height);
            this.frontContext.clearRect(0, 0, this.backEl.width, this.backEl.height);
            this.imageUrlList.push(this.getImgUrl(this.backEl));
        }
    }

    putImageData (context, imageData) {
        context.putImageData(imageData, 0, 0);
    }

    getImageData (context) {
        return context.getImageData(0, 0, this.backEl.width, this.backEl.height);
    }

    getImgUrl (canvas, type, encoderOptions) {
        return canvas.toDataURL(type, encoderOptions);
    }

    drawImg (context, imgUrl, fn) {
        let imgLoad = new Image();
        imgLoad.onload = () => {
            context.drawImage(imgLoad, 0, 0, this.backEl.width, this.backEl.height);
            fn && fn();
        };
        imgLoad.src = imgUrl;
    }

    _getCoordinate (e) {
        this.coordinateX = e.touches[0].pageX - this.sizeNodeStyle.left;
        this.coordinateY = e.touches[0].pageY - this.sizeNodeStyle.top;
    }

    _initContextStyle () {
        this.frontContext.strokeStyle = this.setting.color;
        this.frontContext.lineWidth = this.setting.px;
        this.frontContext.lineJoin = 'round';
    }
}

class DrawControl {
    constructor (backEl, frontEl, sizeNode) {
        this.cObj = new DrawCanvas(backEl, frontEl, sizeNode);
        this.restoreList = [];
    }

    init (touchMoveFn, touchEndFn) {
        this.cObj.init(touchMoveFn, touchEndFn);
    }

    setColor (color) {
        this.cObj.setting.color = color;
    }

    setPx (px) {
        this.cObj.setting.px = px;
    }

    setEraser () {
        this.setColor('#ffffff');
    }

    clearFront () {
        this.cObj.clear(this.cObj.frontContext);
    }

    clearBack () {
        this.cObj.clear(this.cObj.context);
    }

    clearAll () {
        this.cObj.clear();
    }

    reset () {
        this.restoreList = [];
        this.cObj.settingReset();
        this.clearAll();
    }

    back () {
        if (this.cObj.imageUrlList.length <= 1) {
            return;
        }
        let imageUrl = this.cObj.imageUrlList.pop(),
            displayImg = this.cObj.imageUrlList.slice(-1)[0];
        this.restoreList.push(imageUrl);
        this.clearBack();
        this.drawBackImg(displayImg);
        console.log(this.cObj.imageUrlList.length);
    }

    recover () {
        if (this.restoreList.length === 0) {
            return;
        }
        let imageUrl = this.restoreList.pop();
        this.cObj.imageUrlList.push(imageUrl);
        this.clearBack();
        this.drawBackImg(imageUrl);
        console.log(this.cObj.imageUrlList.length);
    }

    getImgUrlList () {
        return this.cObj.imageUrlList;
    }

    setImgUrlList (imgUrlList) {
        this.cObj.imageUrlList = imgUrlList;
    }

    getBackImgUrl (type, encoderOptions) {
        return this.cObj.getImgUrl(this.cObj.backEl, type, encoderOptions);
    }

    getFrontImgUrl (type, encoderOptions) {
        return this.cObj.getImgUrl(this.cObj.frontEl, type, encoderOptions);
    }

    drawBackImg (imgUrl) {
        this.cObj.drawImg(this.cObj.context, imgUrl);
    }

    drawFrontImg (imgUrl) {
        this.cObj.drawImg(this.cObj.frontContext, imgUrl);
    }

    disabled () {
        this.cObj.unBindEvent();
    }
}

export default DrawControl;
