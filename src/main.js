import './assets/main.css'

// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia'
import App from './App.vue';
import router from './router'; // Импортируем роутер

const app = createApp(App);

app.use(router); // Подключаем роутер
app.use(createPinia())
app.mount('#app');
