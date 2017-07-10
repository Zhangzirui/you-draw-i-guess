<template>
    <div class="inputWrap">
        <input type="text" placeholder="点击输入聊天" ref="inputMsg">
        <button class="chatBtn" @click="sendMsg" @keyup.enter="sendMsg">发送</button>
    </div>
</template>

<script type="text/ecmascript-6">
    import eventHub from '@/common/js/eventHub.js';
    export default {
        methods: {
            sendMsg () {
                eventHub.$emit('sendMsg', {
                    msg: this.$refs.inputMsg.value
                });
                console.log(this.$refs.inputMsg.value);
                this.$refs.inputMsg.value = '';
                console.log(this.$refs.inputMsg.value);
            }
        }
    };
</script>

<style lang="scss" type="text/scss" scoped>
    .inputWrap {
        width: 100%;
        padding: 1rem 0;
        text-align: center;
        font-size: 1.4rem;
        line-height: 2rem;
        input[type=text] {
            width: 60%;
            padding: 0.2rem 1rem;
            box-shadow: 1px 1px 1px 1px rgba(123, 84, 11, 0.2);
        }
        .chatBtn {
            padding: 0.2rem 1rem;
            margin-left: 0.5rem;
            box-sizing: border-box;
            color: #ffffff;
            background-color: #FFAE17;
            box-shadow: 1px 1px 1px 1px rgba(123, 84, 11, 0.1);
        }
    }
</style>
