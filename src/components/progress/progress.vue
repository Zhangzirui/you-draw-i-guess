<template>
    <div class="progressWrap">
        <div class="progress">
            <span class="moveBtn" ref="moveBtn"></span>
        </div>
        <span class="progressValue">{{this.value}}px</span>
    </div>
</template>

<script type="text/ecmascript-6">
    import Drag from '@/common/js/drag.js';
    import eventHub from '@/common/js/eventHub.js';
    export default {
        data () {
            return {
                value: 0,
                max: 20
            };
        },
        mounted () {
            this.initProgress();
        },
        methods: {
            initProgress () {
                let dragBtn = new Drag('.moveBtn'),
                    btnStyle = this.$refs.moveBtn.getBoundingClientRect(),
                    progressStyle = this.$refs.moveBtn.parentNode.getBoundingClientRect();
                dragBtn.init({
                    left: 0,
                    right: progressStyle.width - btnStyle.width,
                    top: 0,
                    bottom: 0
                }, () => {
                    this.value = Math.floor(dragBtn.getDistance().disX / (progressStyle.width - btnStyle.width) * this.max);
                    eventHub.$emit('choosePx', this.value);
                });
            }
        }
    };
</script>

<style lang="scss" type="text/scss" scoped>
    .progressWrap {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .progress {
            position: relative;
            flex: 1 0 auto;
            height: 6px;
            border-radius: 3px;
            box-shadow: 1px 1px 1px 1px #ababab inset;
            background: #ffffff;
            .moveBtn {
                position: absolute;
                left: 0;
                top: -3px;
                height: 12px;
                width: 12px;
                border-radius: 50%;
                box-shadow: #aaaaaa;
                background: #FFAE17;
            }
        }
        .progressValue {
            flex: 0 0 2.5rem;
            font-size: 1.4rem;
            font-weight: 500;
            padding-left: 0.5rem;
            color: #5b5b5b;
        }
    }
</style>
