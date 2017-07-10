<template>
    <div ref="tooltipWrap" class="tooltip">
        <v-progress v-if=" content === 'px' "></v-progress>
        <div v-else-if=" content === 'color' " class="colorWrap" @click="chooseColor">
            <div class="colorCol">
                <span class="colorItem"></span>
                <span class="colorItem"></span>
            </div>
            <div class="colorCol">
                <span class="colorItem"></span>
                <span class="colorItem"></span>
            </div>
            <div class="colorCol">
                <span class="colorItem"></span>
                <span class="colorItem"></span>
            </div>
            <div class="colorCol">
                <span class="colorItem"></span>
                <span class="colorItem"></span>
            </div>
        </div>
        <div v-else-if=" content === 'rightAnswer' " class="rightAnswerWrap">
            <p>正确答案：</p>
            <p class="rightAnswer">{{ this.rightAnswer }}</p>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import progress from '@/components/progress/progress';
    import eventHub from '@/common/js/eventHub.js';
    export default {
        data () {
            return {
                colorArr: [],
                colorItems: null,
                rightAnswer: null
            };
        },
        props: {
            content: [String]
        },
        components: {
            'v-progress': progress
        },
        mounted () {
            this.__initColor = this.getSingle(this.initColor);
            this.$watch(() => this.content, newValue => {
                if (newValue === 'color') {
                    this.__initColor();
                    this.setColor();
                } else if (newValue === 'rightAnswer') {
                    eventHub.on('youEnd', data => {
                        this.rightAnswer = data;
                    });
                }
            });
        },
        methods: {
            getSingle (fn) {
                let result = null;
                return function (...rest) {
                    return result || (result = fn.apply(null, rest));
                };
            },
            initColor () {
                this.colorArr = ['#FFFF00', '#3FF1F0', '#FF9D1F', '#FF0000', '#00FF00', '#0000FF', '#D67FF3', '#000000'];
                this.colorItems = document.querySelectorAll('.colorItem');
            },
            setColor () {
                console.log('test');
                console.log(this.colorItems);
                console.log(this.colorArr);
                Array.from(this.colorItems).forEach((item, index) => {
                    item.style.backgroundColor = this.colorArr[index];
                });
            },
            chooseColor (event) {
                let e = event || window.event,
                    target = e.target || e.srcElement;
                Array.from(this.colorItems).forEach((item, index) => {
                    if (item === target) {
                        eventHub.$emit('chooseColor', this.colorArr[index]);
                    }
                });
            }
        }
    };
</script>

<style lang="scss" type="text/scss" scoped>
    .tooltip {
        border: 1px solid rgb(205, 205, 205);
        padding: 1rem;
        /*overflow: hidden;*/
        box-shadow: 1px 1px 18px 1px rgba(58, 181, 181, 0.3), -1px -1px 18px 1px rgba(58, 181, 181, 0.3);
        background: #dddddd;
        z-index: 9999;
        .colorWrap {
            display: flex;
            width: 100%;
            height: 9rem;
            justify-content: space-around;
            .colorCol {
                display: flex;
                flex-flow: column nowrap;
                justify-content: space-around;
                flex: 0 0 auto;
                .colorItem {
                    flex: 0 0 auto;
                    width: 3rem;
                    height: 3rem;
                    border-radius: 50%;
                    border: 1px solid rgba(7, 17, 27, 0.2);
                }
            }
        }
        .rightAnswerWrap {
            text-align: center;
            line-height: 3rem;
            font-size: 2.4rem;
            p:first-child {
                font-weight: 900;
            }
            .rightAnswer {
                font-weight: 600;
                text-shadow: 1px 1px 4px #ffffff, -1px -1px 4px #ffffff;
                color: red;
            }
        }
    }
</style>
