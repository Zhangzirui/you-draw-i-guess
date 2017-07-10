<template>
    <div id="app">
        <v-header></v-header>
        <div class="main">
            <router-view></router-view>
            <v-chat-display class="chatDisplay" :speaker="speaker" :msg="msg"></v-chat-display>
        </div>
        <v-tooltip class="tooltip" v-show="showTooltip"  :content="tooltipContent"></v-tooltip>
        <v-chat-input class="chatInput"></v-chat-input>
        <v-mask class="mask" v-show="showTooltip"></v-mask>
    </div>
</template>

<script>
    import header from '@/components/header/header';
    import chatDisplay from '@/components/chatDisplay/chatDisplay';
    import chatInput from '@/components/chatInput/chatInput';
    import tooltip from '@/components/tooltip/tooltip';
    import mask from '@/components/mask/mask';
    import eventHub from '@/common/js/eventHub.js';
    export default {
        data () {
            return {
                msg: 'null',
                speaker: 'null',
                showTooltip: false,
                tooltipContent: null
            };
        },
        name: 'app',
        components: {
            'v-header': header,
            'v-chat-display': chatDisplay,
            'v-chat-input': chatInput,
            'v-tooltip': tooltip,
            'v-mask': mask
        },
        mounted () {
            this.socketOn();
            this.eventOn();
        },
        methods: {
            socketOn () {
                this.$socket.on('enterRoom', data => {
                    this.msg = `“${decodeURI(data.name)}”进入房间`;
                    this.speaker = `系统`;
                });

                this.$socket.on('displayMsg', data => {
                    this.speaker = decodeURI(data.speaker);
                    this.msg = decodeURI(data.msg);
                });

                this.$socket.on('disconnect_broadcast', data => {
                    this.speaker = `系统`;
                    this.msg = `“${decodeURI(data.user.name)}”已掉线或离开了房间`;
                });

                this.$socket.on('youBegin', data => {
                    this.$router.replace('/game');
                    setTimeout(() => {
                        eventHub.$emit('begin_guessTitle', data.guessTitle);
                        eventHub.$emit('begin_userList', data.onlineUserList);
                    }, 0);
                });
            },
            eventOn () {
                eventHub.$on('sendMsg', data => {
                    this.$socket.emit('sendMsg', {
                        'msg': encodeURI(data.msg),
                        'speaker': eventHub.$user.name
                    });
                });

                eventHub.$on('youEnd', () => {
                    this.showTooltip = true;
                    this.tooltipContent = 'rightAnswer';
                    setTimeout(() => {
                        this.showTooltip = false;
                        this.tooltipContent = null;
                        this.$socket.emit('sendStartGame');
                    }, 5000);
                });
            }
        }
    };
</script>

<style lang="scss" type="text/scss" scoped>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        .main {
            position: absolute;
            top: 3.8rem;
            bottom: 0;
            width: 100%;
            overflow: hidden;
            background-color: #3ab5b7;
            .chatDisplay {
                background-color: rgba(7, 17, 27, 0.2);
            }
            .tooltip {
                position: absolute;
                width: 60%;
                top: 50%;
                margin: 0 auto;
                transform: translateY(-50%);
                z-index: 9999;
            }
        }
        .chatInput {
            position: absolute;
            bottom: 2rem;
        }
        .mask {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }
</style>
