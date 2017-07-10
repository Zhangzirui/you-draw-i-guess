// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import io from '@/../static/lib/socket.io.js';
import 'babel-polyfill';

import '@/common/style/base.scss';

Vue.config.productionTip = false;

Vue.prototype.$socket = io.connect('http://10.11.6.133:3000');

router.push('/room');
// router.push('/game');

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: {App}
});
