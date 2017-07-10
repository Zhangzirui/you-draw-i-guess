import user from '../service/userService'
import {
    onlineUserList,
    dealUserData,
    leaveUserData,
    sortUserList,   // 在前端座位改变的时候用户位置排序
    single_changeUserList,  // 改变所有用户的状态为进入游戏状态
    changeUserStatus,   // 改变用户的状态，该谁画画了
    getGuessTitle,   // 获取所要画的题目
    getGameMsg,
    setCanvasImgs,
    setEndTime     //保存倒计时结束的时间
} from '../service/dataModel';

export default class Controller {
    constructor (socket, io) {
        this.$socket = socket;
        this.io = io;
        this.init();
    }

    init () {
        this.socketOn();
    }

    socketOn () {
        this.$socket.on('login', data => {
            console.log(`*****************
                         **     login   **
                         *****************`);
            let userData = dealUserData(data);

            this.$socket.user = userData;
            // 向除了自己之外的客户端广播
            this.$socket.broadcast.emit('enterRoom', {'name': `${userData.name}`});
            // 向自己广播
            this.$socket.emit('loginSuccess', userData);
            // 向所有的客户端广播
            this.io.sockets.emit('loginSuccess_broadcast', onlineUserList);
        });

        this.$socket.on('sendMsg', data => {
           this.io.sockets.emit('displayMsg', data);
        });

        this.$socket.on('changeIndex', data => {
            sortUserList(data);
            this.io.sockets.emit('changeIndexEnd', onlineUserList);
        });

        this.$socket.on('disconnect', () => {
            if (!this.$socket.user) {
                return;
            }
            console.log(`${decodeURI(this.$socket.user.name)}已掉线`);
            leaveUserData(this.$socket.user);
            this.$socket.broadcast.emit('disconnect_broadcast', {
                'user': this.$socket.user,
                'onlineUserList': onlineUserList
            });
        });

        this.$socket.on('sendStartGame', () => {
            let guessTitle = getGuessTitle();
            // 开始游戏， 将用户状态更改
            single_changeUserList();
            changeUserStatus();
            this.io.sockets.emit('youBegin', {
                guessTitle,
                onlineUserList
            });
        });

        this.$socket.on('sendImg', data => {
            this.$socket.broadcast.emit('displayImg', data);
        });

        // TODO 不只有停笔的时候改变了backImg，得完善
        this.$socket.on('sendBackImg', data => {
            setCanvasImgs(data);
        });

        this.$socket.on('touchEnd', () => {
            this.$socket.broadcast.emit('updateImgUrlList');
        });

        this.$socket.on('back', () => {
            this.$socket.broadcast.emit('canvasBack');
        });

        this.$socket.on('recover', () => {
            this.$socket.broadcast.emit('canvasRecover');
        });

        this.$socket.on('clear', () => {
            this.$socket.broadcast.emit('canvasClear');
        });

        this.$socket.on('endTime', data => {
            setEndTime(data);
        });

        this.$socket.on('loginAgain', () => {
            let msg = getGameMsg();
            this.$socket.emit('loginAgain_header', {
                endTime: msg.endTime,
                guessTitle: msg.guessTitle
            });
            this.$socket.emit('loginAgain_canvasImg', msg.canvasImgs.slice(-1)[0]); // 先只传一张base64图片过去，不影响页面渲染
            this.$socket.emit('loginAgain_canvasImgs', msg.canvasImgs);
        })
    }

}
