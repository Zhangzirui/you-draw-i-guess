<template>
    <div class="chatWrap" ref="wrap"></div>
</template>

<script type="text/ecmascript-6">
    import {Animate} from '@/common/js/animate';
    export default {
        data () {
            return {
                name: null,
                content: null
            };
        },
        props: {
            msg: [String],
            speaker: [String]
        },
        created () {
            this.$watch(() => this.msg, () => {
                this.preDeal();
                this.createMsg();
                let allMsg = document.getElementsByClassName('msg'),
                    targetMsg = allMsg[allMsg.length - 1],
                    distance = 0;
                if (allMsg.length >= 2) {
                    distance = this.getDistance(allMsg[allMsg.length - 2]);
                }
                this.msgScroll(targetMsg, distance);
            });
        },
        methods: {
            preDeal () {
                this.name = this.speaker;
                this.content = this.msg;
                if (this.name === '系统') {
                    this.content += '！';
                }
            },
            createMsg () {
                let html = `<div class="msg">
                                <span class="name">${this.name}：</span>
                                <span class="content">${this.content}</span>
                            </div>`;
                this.$refs.wrap.insertAdjacentHTML('beforeend', html);
            },
            // 防止两条消息挨得太近或者重叠
            getDistance (dom) {
                let distance = document.body.getBoundingClientRect().width - dom.getBoundingClientRect().right;
                if (distance > 50) {
                    return 0;
                } else {
                    return 50 - distance;
                }
            },
            msgScroll (dom, distance) {
                let rightDis = document.body.getBoundingClientRect().width + distance,
                    allDis = rightDis + dom.getBoundingClientRect().width;
                let allT = allDis / 0.05;
                let msg = new Animate(function (p) {
                    dom.style.transform = `translateX(${rightDis - allDis * p}px)`;
                }, allT);
                async function run () {
                    await msg.animate();
                    dom.parentNode.removeChild(dom);
                }
                run();
            }
        }
    };
</script>

<style lang="scss" type="text/scss">
    .chatWrap {
        position: relative;
        padding: 0.5rem 0;
        height: 3rem;
        font-size: 1.6rem;
        line-height: 2rem;
        box-sizing: border-box;
        color: rgba(7, 17, 27, 0.8);
        overflow: hidden;
        white-space: nowrap;
        .msg {
            position: absolute;
            display: inline-block;
            .name {
                color: rgb(0, 255, 0)
            }
        }
    }
</style>
