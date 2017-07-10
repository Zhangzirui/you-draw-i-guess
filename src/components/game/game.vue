<template>
    <div class="game">
        <canvas class="drawCanvas" ref="drawCanvas"></canvas>
        <canvas class="frontCanvas" ref="frontCanvas"></canvas>
        <div class="drawTab" v-show="isDraw">
            <ul ref="tab" @click="bindEvent($event)">
                <li class="iconfont tab__item">&#xe607;</li>
                <li class="iconfont tab__item">&#xe64c;</li>
                <li class="iconfont tab__item">&#xe61d;</li>
                <li class="iconfont tab__item">&#xe74f;</li>
                <li class="iconfont tab__item">&#xe600;</li>
                <li class="iconfont tab__item">&#xe612;</li>
            </ul>
        </div>
        <v-tooltip class="tooltipWrap" :content="tooltipContent" v-show="showTool"></v-tooltip>
    </div>
</template>

<script type="text/ecmascript-6">
    import tooltip from '@/components/tooltip/tooltip';
    import DrawControl from '@/common/js/drawCanvas.js';
    import eventHub from '@/common/js/eventHub.js';
    export default {
        data () {
            return {
                drawCanvas: null,
                showTool: false,
                tooltipContent: 'null',
                isDraw: false,
                imgUrl: null,
                backImgUrl: null,
                imgUrlList: [],
                drawStatus: null
            };
        },
        components: {
            'v-tooltip': tooltip
        },
        mounted () {
            this.initCanvas();
            eventHub.$on('begin_userList', data => {
                console.log('***********youBegin**********');
                eventHub.$userList = data;
                eventHub.$userList.forEach(item => {
                    if (item.id === eventHub.$user.id) {
                        this.isDraw = item.status === 2;
                    }
                });
//                this.drawCanvas.clearAll();
                if (!this.isDraw) {
                    this.drawCanvas.disabled();
                } else {
                    this.toolEventOn();
                }
                // 得this.isDraw被赋予结果后才能执行后面的
                this.watch();
                this.socketOn();
            });
        },
        methods: {
            initCanvas () {
                this.drawCanvas = new DrawControl(this.$refs.drawCanvas, this.$refs.frontCanvas);
                this.drawCanvas.init(() => {
                    if (this.isDraw) {
                        this.drawStatus = 'touchMove';
                        this.imgUrl = this.drawCanvas.getFrontImgUrl();
                    }
                }, () => {
                    if (this.isDraw) {
                        this.drawStatus = 'touchEnd';
                    }
                });
            },
            bindEvent (event) {
                // 给工具栏绑定事件
                let e = event || window.event,
                    target = e.target || e.srcElement;
                let tabArr = Array.from(this.$refs.tab.children);
                tabArr.forEach((item, index) => {
                    if (item === target) {
                        switch (index) {
                            case 0:
                                this.drawCanvas.back();
                                this.$socket.emit('back');
                                break;
                            case 1:
                                this.drawCanvas.recover();
                                this.$socket.emit('recover');
                                break;
                            case 2:
                                if (this.tooltipContent !== 'px') {
                                    this.tooltipContent = 'px';
                                    this.showTool = true;
                                } else {
                                    this.showTool = false;
                                    this.tooltipContent = 'null';
                                }
                                break;
                            case 3:
                                if (this.tooltipContent !== 'color') {
                                    this.tooltipContent = 'color';
                                    this.showTool = true;
                                } else {
                                    this.showTool = false;
                                    this.tooltipContent = 'null';
                                }
                                break;
                            case 4:
                                this.drawCanvas.setEraser();
                                break;
                            case 5:
                                this.drawCanvas.clearAll();
                                this.$socket.emit('clear');
                                break;
                        }
                    }
                });
            },
            toolEventOn () {
                eventHub.$on('choosePx', data => {
                    if (this.showTool && this.tooltipContent === 'px') {
                        this.drawCanvas.setPx(data);
                    }
                });

                eventHub.$on('chooseColor', data => {
                    if (this.showTool && this.tooltipContent === 'color') {
                        this.drawCanvas.setColor(data);
                    }
                });
            },
            watch () {
                console.log('*********watch*******this.isDraw： ' + this.isDraw + '******');
                if (this.isDraw) {
                    //  每次下笔的图案
                    this.$watch('imgUrl', newValue => {
                        this.$socket.emit('sendImg', newValue);
                    });
                    // 叠加的图案
                    this.$watch('backImgUrl', newValue => {
                        this.$socket.emit('sendBackImg', newValue);
                    });
                    this.$watch('drawStatus', newValue => {
                        if (newValue === 'touchEnd') {
                            this.$socket.emit('touchEnd');
                        }
                    });
                }
            },
            socketOn () {
                console.log('*********socketOn*******this.isDraw： ' + this.isDraw + '******');
                if (!this.isDraw) {
                    this.imgUrlList = this.drawCanvas.getImgUrlList();
                    // 非画画人身份，只有frontCanvas有效
                    // 将增量接受每一笔的图像显示在frontCanvas上
                    this.$socket.on('displayImg', data => {
                        this.imgUrl = data;
                        this.drawCanvas.drawBackImg(this.imgUrl);     // 正在画的时候画到frontCanvas上
                    });
                    // 每次停止落笔，将画面保存一下，为撤回和恢复功能做准备
                    this.$socket.on('updateImgUrlList', () => {
                        this.backImgUrl = this.drawCanvas.getBackImgUrl();
                        this.imgUrlList.push(this.backImgUrl);
                        console.log(this.imgUrlList.length);
                    });
                    this.$socket.on('canvasBack', () => {
                        this.drawCanvas.setImgUrlList(this.imgUrlList);
                        this.drawCanvas.back();
                    });
                    this.$socket.on('canvasRecover', () => {
                        this.drawCanvas.recover();
                    });
                    this.$socket.on('canvasClear', () => {
                        this.drawCanvas.clearAll();
                        console.log(this.imgUrlList.length);
                    });
                }
            }
        }
    };
</script>

<style lang="scss" type="text/scss" scoped>
    .game {
        position: relative;
        width: 100%;
        font-size: 0;
        .drawCanvas,
        .frontCanvas {
            height: 27rem;
            width: 100%;
            border-top: 1px solid rgba(7, 17, 27, 0.3);
            border-bottom: 1px solid rgb(7, 17, 27);
            box-sizing: border-box;
            background: #ffffff;
        }
        .frontCanvas {
            position: absolute;
            top: 0;
            left: 0;
            background: rgba(255, 255, 255, 0);
        }
        .drawTab {
            height: 4rem;
            border-bottom: 1px solid rgba(7, 17, 27, 0.2);
            box-sizing: border-box;
            background: #dddddd;
            ul {
                font-size: 0;
                display: flex;
                justify-content: space-around;
                .tab__item {
                    flex: 1 0 auto;
                    display: inline-block;
                    line-height: 4rem;
                    font-size: 2.8rem;
                    text-align: center;
                    color: #719c9c;
                    text-shadow: 1px 1px 1px #666666;
                    &:hover {
                        color: #537373;
                        background: #c0c0c0;
                    }
                }

            }
        }
        .tooltipWrap {
            position: absolute;
            bottom: 5rem;
            width: 60%;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
        }
    }
</style>
