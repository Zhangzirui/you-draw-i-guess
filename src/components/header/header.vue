<template>
    <div class="header">
        <div class="title" v-show="isShow">
            <div v-if="isDraw">
                <span>你要画：</span>
                <span class="draw-title" ref="drawTitle">{{ this.guessTitle }}</span>
            </div>
            <div v-else>
                <span>提示：</span>
                <span class="draw-title" ref="reminder">{{ this.reminder }}</span>
            </div>

        </div>
        <div class="brand"></div>
        <div class="countdown" v-show="isShow">
            <span class="seconds" ref="seconds">{{ this.remainTime }}</span>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import eventHub from '@/common/js/eventHub';
    import Countdown from '@/common/js/countdown';
    import {storage} from '@/common/js/util';
    export default {
        data () {
            return {
                isDraw: true,
                isShow: false,
                guessTitle: null,
                reminder: null,
                remainTime: 60
            };
        },
        created () {
            this.eventOn();
            this.socketOn();
        },
        methods: {
            eventOn () {
                eventHub.$on('begin_guessTitle', data => {
                    this.guessTitle = decodeURI(data);
                    let beginTime = Date.now(),
                        endTime = new Date(beginTime + 6e4);
                    // 将 endTime 传到后台存储，以便于掉线后重复登录的用户获取
                    this.$socket.emit('endTime', endTime);
                    this.isShow = true;
                    this.countDown(endTime);
                });
            },
            socketOn () {
                this.$socket.on('loginAgain_header', data => {
                    this.guessTitle = decodeURI(data.guessTitle);
                    this.isShow = true;
                    this.countDown(data.endTime);
                });
            },
            countDown (num) {
                let gameTime = new Countdown(num);
                gameTime.init((dif, timeObj) => {
                    this.remainTime = timeObj.second;
                    if (dif === 0) {
                        eventHub.$emit('youEnd', this.guessTitle);
                    }
                });
            }
        }
    };
</script>

<style lang="scss" type="text/scss" scoped>
    .header {
        display: flex;
        justify-content: space-between;
        height: 3.8rem;
        width: 100%;
        background-color: #6DE3E7;
        color: #ffffff;
        .title {
            flex: 0 0 auto;
            margin: 0.5rem;
            font-size: 1.2rem;
            text-shadow: 1px 1px 4px #ffffff, -1px -1px 4px #ffffff;
            color: rgba(7, 17, 27, 0.7);
            span {
                display: block;
            }
            .draw-title {
                font-weight: 600;
                color: red;
            }
        }
        .brand {
            flex: 0 0 auto;
            width: 14rem;
            height: 100%;
            margin: 0 auto;
            background: url('./brand.png') no-repeat;
            background-size: cover;
            background-position: 0 -1px;
        }
        .countdown {
            flex: 0 0 3.8rem;
            margin: 0.5rem 0;
            text-align: center;
            .seconds {
                display: inline-block;
                height: 2.8rem;
                width: 2.8rem;
                border-radius: 50%;
                border: 3px solid;
                font-size: 1.6rem;
                line-height: 2.5rem;
                background-color: #FFAE17;
                box-sizing: border-box;
            }
        }
    }
</style>
