import Vue from 'vue';
import Router from 'vue-router';
import room from '@/components/room/room';
import game from '@/components/game/game';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/room',
            name: 'room',
            component: room
        },
        {
            path: '/game',
            name: 'game',
            component: game
        }
    ]
});
