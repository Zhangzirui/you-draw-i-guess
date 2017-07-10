/*
* 倒计时的构造函数
* （允许设定在剩下多少秒的时候执行外部传进来的回调函数）
* */

class Countdown {
    // 初始传入的time，可以是数字或者数字字符串，比如60，表示倒计时60s
    // time 还可以是未来的一个时间，必须是Date格式
    constructor (time) {
        if (typeof time === 'number' || typeof time === 'string') {
            this.future = new Date(time * 1000 + Date.now());
        } else if (time instanceof Date && time.getTime() > Date.now()) {
            this.future = time;
        } else {
            throw new Error('Error setting in countdown!');
        }
    }

    init (callback) {
        this.timer = setTimeout(() => {
            let remainTime = this.getRemainTime();
            // callback 的参数
            // this.difference 是还剩下时间的毫秒数
            // remainTime 是还剩下时间的对象表示
            callback && callback(this.difference, remainTime);
        }, 200);
    }

    getDifference () {
        return this.future.getTime() - Date.now();
    }

    getRemainTime () {
        this.difference = Math.floor(this.getDifference() / 1000);
        if (this.difference < 0) {
            this.stopCountdown();
            return;
        }
        let day = Math.floor(this.difference / 86400);
        if (day >= 1) {
            this.difference -= day * 86400;
        }
        let hour = Math.floor(this.difference / 3600);
        if (hour >= 1) {
            this.difference -= hour * 3600;
        }
        let minuter = Math.floor(this.difference / 60);
        if (minuter >= 1) {
            this.difference -= minuter * 60;
        }
        let second = this.difference;
        return {
            day,
            hour,
            minuter,
            second
        };
    }

    stopCountdown () {
        clearTimeout(this.timer);
        this.timer = null;
    }
}

export default Countdown;
