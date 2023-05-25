import './assets/main.css'

import { createApp } from 'vue'
import {createPinia} from "pinia";
import Vue3TouchEvents from "vue3-touch-events";
import VueKonva from 'vue-konva';

import App from './App.vue'


const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(Vue3TouchEvents);
app.use(VueKonva);
app.mount('#app')