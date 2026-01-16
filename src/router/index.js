// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Main from '../components/Main.vue';
import Rus from '../components/Rus.vue';

// .avatar-icon{
//   display: flex;
//   justify-content: center;
//   align-items: center;
// }
// .avatar-icon-img{
//   width: 30px;
//   height: auto;
// }

// Определение маршрутов
const routes = [
  {
    path: '/', // Путь к странице
    name: 'Home', // Имя маршрута (опционально)
    component: Home, // Компонент, который будет отображаться
  },
  {
    path: '/:count/play',
    name: 'Main',
    component: Main,
  },
  {
    path: '/rus/:count',
    name: 'Rus',
    component: Rus,
  },

];

const router = createRouter({
 history: createWebHashHistory(), // решает проблемы с роутингом
  routes,
});

export default router;