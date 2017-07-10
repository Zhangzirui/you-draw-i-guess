<template>
    <div class="room">
        <div class="joinRoom">
            <div class="row">
                <span class="col" @click="changeIdentify($event)" data-index="0">
                    <span class="userName"></span>
                    <span class="userHook">房主</span>
                </span>
                <span class="col" @click="changeIdentify($event)"  data-index="1">
                    <span class="userName"></span>
                    <span class="userHook">坐下</span>
                </span>
                <span class="col" @click="changeIdentify($event)" data-index="2">
                    <span class="userName"></span>
                    <span class="userHook">坐下</span>
                </span>
            </div>
            <div class="row">
                <span class="col" @click="changeIdentify($event)" data-index="3">
                    <span class="userName"></span>
                    <span class="userHook">坐下</span>
                </span>
                <span class="col" @click="changeIdentify($event)" data-index="4">
                    <span class="userName"></span>
                    <span class="userHook">坐下</span>
                </span>
                <span class="col" @click="changeIdentify($event)" data-index="5">
                    <span class="userName"></span>
                    <span class="userHook">坐下</span>
                </span>
            </div>
            <div class="row">
                <span class="col" @click="changeIdentify($event)" data-index="6">
                    <span class="userName"></span>
                    <span class="userHook">坐下</span>
                </span>
                <span class="col" @click="changeIdentify($event)" data-index="7">
                    <span class="userName"></span>
                    <span class="userHook">坐下</span>
                </span>
                <span class="col" @click="changeIdentify($event)" data-index="8">
                    <span class="userName"></span>
                    <span class="userHook">坐下</span>
                </span>
            </div>
        </div>
        <div class="startGame">
            <span class="startGame__btn" @click="startGame()">房主可以开始游戏</span>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import cookieUtil from '@/common/js/cookieUtil.js';
    import eventHub from '@/common/js/eventHub.js';

    export default {
        data () {
            return {
                msg: 'null',
                speaker: 'null'
            };
        },
        mounted () {
            this.beginSocket();
        },
        methods: {
            beginSocket () {
                this.userLogin();
                this.socketOn();
            },
            // socket.on 监听事件
            socketOn () {
                this.$socket.on('loginSuccess', data => {
                    eventHub.$user = data;
                    cookieUtil.set('userName', data.name);
                    if(data.status !== 0) {
                        this.dealLoginAgain();
                    }
                });

                this.$socket.on('loginSuccess_broadcast', data => {
                    eventHub.$userList = this.dealUserList(data);
                    console.log('*****loginSuccess_broadcast******');
                    console.log(eventHub.$userList);
                    this.renderRoom(eventHub.$userList);
                });

                this.$socket.on('changeIndexEnd', data => {
                    eventHub.$userList = this.dealUserList(data);
                    console.log('*****changeIndexEnd******');
                    console.log(eventHub.$userList);
                    this.renderRoom(eventHub.$userList);
                });

                this.$socket.on('disconnect_broadcast', data => {
                    eventHub.$userList = this.dealUserList(data.onlineUserList);
                    console.log('*****disconnect_broadcast******');
                    console.log(eventHub.$userList);
                    this.renderRoom(eventHub.$userList);
                });
            },
            userLogin () {
                let userName = cookieUtil.get('userName');

                eventHub.$user = {
                    id: this.getId(),                   // id
                    identity: 'guest',                  // 身份：master/guest
                    name: userName,                    // 昵称
//                    avatar: '',                         // 头像
                    score: 0,                           // 得分
                    index: null,                        // 座位序号
                    status: 0                           // 状态  没有开始游戏时在线：0, 没有开始游戏时离线：1，开始游戏后等待画画：2，开始游戏后等待画画时离线：3，开始游戏后正在画画：4，开始游戏后正在画画时离线： 5
                };
                this.$socket.emit('login', eventHub.$user);
            },
            getId () {
                return '#' + Date.now();
            },
            // 将userList的名字解编码
            dealUserList (data) {
                return data.map(item => {
                    item.name = decodeURI(item.name);
                    return item;
                });
            },
            dealLoginAgain () {
                this.$router.replace('/game');
                this.$socket.emit('loginAgain');
            },
            renderRoom (data) {
                let users = document.getElementsByClassName('userHook'),
                    usersName = document.getElementsByClassName('userName'),
                    cols = document.getElementsByClassName('col');
                users = Array.from(users);
                users.forEach((item, index) => {
                    let className = cols[index].className;
                    if (index === 0) {
                        item.innerHTML = '房主';
                    } else {
                        item.innerHTML = '坐下';
                    }
                    usersName[index].innerHTML = '';
                    if (className.includes('userIn')) {
                        cols[index].className = className.slice(0, className.indexOf('userIn') - 1);
                    }
//                    if (className.includes('userLeave')) {
//                        item.className = className.slice(0, className.indexOf('userLeave') - 1);
//                    }
                });
                data.forEach((item) => {
                    let index = item.index;
                    usersName[index].innerHTML = item.name;
                    if (item.status === 1) {
                        cols[index].className += ' userIn';
                        users[index].innerHTML = item.name.slice(0, 1);
                    }
//                    else {
//                        cols[index].className += ' userLeave';
//                        users[index].innerHTML = '离线';
//                        // TODO 离线的样式
//                    }
                });
            },
            changeIdentify (event) {
                let e = event || window.event,
                    target = e.target || e.srcElement;
                if (target.className === 'userHook') {
                    target = target.parentNode;
                }
                let index = target.getAttribute('data-index');
                if (eventHub.$userList.some(item => item.index === index)) {
                    return;
                }
                eventHub.$user.index = Number(index);
                console.log(eventHub.$user);
                this.$socket.emit('changeIndex', eventHub.$user);
            },
            startGame () {
                if (eventHub.$user.identity === 'master') {
                    this.$socket.emit('sendStartGame');
//                    this.$router.replace('/game');
                }
            }
        }
    };
</script>

<style lang="scss" type="text/scss" scoped>
    .room {
        width: 100%;
        .joinRoom {
            margin-top: 1rem;
            height: 25rem;
            display: flex;
            flex-flow: column nowrap;
            justify-content: space-around;
            .row {
                flex: 0 0 auto;
                height: 5rem;
                width: 100%;
                display: flex;
                justify-content: space-around;
                color: #ffffff;
                .col {
                    position: relative;
                    display: table;
                    flex: 0 0 auto;
                    height: 5rem;
                    width: 5rem;
                    border: 4px solid;
                    border-radius: 50%;
                    font-size: 1.4rem;
                    line-height: 1.8rem;
                    text-align: center;
                    box-sizing: border-box;
                    background-color: rgba(192, 192, 192, 0.75);
                    .userName {
                        position: absolute;
                        top: -2rem;
                        left: 50%;
                        font-size: 1.4rem;
                        line-height: 1.8rem;
                        transform: translateX(-50%);
                        white-space: nowrap;
                    }
                    span:last-child {
                        display: table-cell;
                        vertical-align: middle;
                        padding: 0.5rem;
                    }
                }
                .userIn {
                    font-size: 3rem;
                    background: rgb(3, 169, 244);
                }
                .userLeave {
                    background: rgb(192, 192, 192);
                }
            }
        }
        .startGame {
            margin: 1rem 0;
            height: 3rem;
            text-align: center;
            font-size: 1.6rem;
            color: #ffffff;
            .startGame__btn {
                display: inline-block;
                height: 3rem;
                line-height: 2.4rem;
                padding: 0.2rem 1.2rem;
                border: 2px solid;
                border-radius: 10px;
                box-shadow: 1px 1px 5px 1px rgba(0, 0, 0, 0.2);
                background-color: #FFAE17;
                box-sizing: border-box;
            }
        }
    }
</style>
