<template>
  <div class="lobby-container">
    <div class="liquid-blob blob-1"></div>
    <div class="liquid-blob blob-2"></div>

    <!-- <div class="bg-glow top-left"></div> -->
    <!-- <div class="bg-glow bottom-right"></div> -->

    <header class="lobby-header">
      <h1 class="lobby-title">Настройки монополии</h1>
      <p class="lobby-subtitle">Выберите игровое издание и количество участников</p>
    </header>
    <div class="selector-wrapper">
  <span class="selector-label">ВЫБЕРИТЕ ИЗДАНИЕ</span>
    <div class="map-selector">
      <button 
        :class="['map-btn', { active: selectedMap === 'all' }]" 
        @click="selectedMap = 'all'"
      >
        <div class="btn-content">
          <img class="img-map" :src="'/img/flags/planet.svg'" alt="world">
          <span>Весь мир</span>
        </div>
      </button>
      <button 
        :class="['map-btn', { active: selectedMap === 'rus' }]" 
        @click="selectedMap = 'rus'"
      >
        <div class="btn-content">
          <img class="img-map" :src="'/img/flags/rus.svg'" alt="russia">
          <span>Россия</span>
        </div>
      </button>
    </div>
    </div>


          <span class="selector-label mb-label">КОЛИЧЕСТВО УЧАСТНИКОВ</span>
    <div class="modes-wrapper">
      <div 
        v-for="mode in gameModes" 
        :key="mode.count" 
        class="mode-card"
        @click="startGame(mode.count)"
      >
        <div class="glass-shine"></div>

        <div class="player-previews">
          <div 
            v-for="(player, index) in mode.previewPlayers" 
            :key="index"
            class="avatar-stack-item"
            :style="{ 
              borderColor: player.color, 
              zIndex: mode.previewPlayers.length - index,
              boxShadow: `0 0 15px ${player.color}33`
            }"
          >
            <img class="avatar-img" :src="player.icon" alt="avatar">
          </div>
        </div>
        
        <div class="mode-info">
          <h2 class="mode-name">Игроков: {{ mode.count }}</h2>
          <div class="survival-badge">
             <!-- <span class="skull-icon">💀</span>  -->
             <span>Режим выживания <br> на {{ mode.survivalAfter }} ходу</span>
          </div>
        </div>
        
        <div class="button-wrapper">
          <button class="select-button">
            <span class="btn-text">Выбрать</span>
            <div class="arrow-container">
              <svg class="arrow-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const selectedMap = ref('all');

const gameModes = computed(() => {
  if (selectedMap.value === 'all') {
    // Стандартные настройки для "Весь мир" (2-5 игроков)
    return [
       { count: 2, survivalAfter: 80, previewPlayers: [{ icon: '/img/hero/animal-1.svg', color: '#ff4d4d' }, { icon: '/img/hero/animal-4.svg', color: '#ffaa00' }] },
  { count: 3, survivalAfter: 100, previewPlayers: [{ icon: '/img/hero/animal-1.svg', color: '#ff4d4d' }, { icon: '/img/hero/animal-4.svg', color: '#ffaa00' }, { icon: '/img/hero/animal-3.svg', color: '#68d391' }] },
  { count: 4, survivalAfter: 115, previewPlayers: [{ icon: '/img/hero/animal-1.svg', color: '#ff4d4d' }, { icon: '/img/hero/animal-4.svg', color: '#ffaa00' }, { icon: '/img/hero/animal-3.svg', color: '#68d391' }, { icon: '/img/hero/animal-2.svg', color: '#4d94ff' }] },
  { count: 5, survivalAfter: 130, previewPlayers: [{ icon: '/img/hero/animal-1.svg', color: '#ff4d4d' }, { icon: '/img/hero/animal-4.svg', color: '#ffaa00' }, { icon: '/img/hero/animal-3.svg', color: '#68d391' }, { icon: '/img/hero/animal-2.svg', color: '#4d94ff' }, { icon: '/img/hero/animal-5.svg', color: '#b06ee6' }] }
    ];
  } else {
    return [
      { count: 2, survivalAfter: 80, previewPlayers: [{ icon: '/img/hero/animal-8.svg', color: '#ff4d4d' }, { icon: '/img/hero/animal-9.svg', color: '#ffa500' }] },
  { count: 3, survivalAfter: 100, previewPlayers: [{ icon: '/img/hero/animal-8.svg', color: '#ff4d4d' }, { icon: '/img/hero/animal-9.svg', color: '#ffa500' }, { icon: '/img/hero/animal-6.svg', color: '#68d391' }] },
  { count: 4, survivalAfter: 115, previewPlayers: [{ icon: '/img/hero/animal-8.svg', color: '#ff4d4d' }, { icon: '/img/hero/animal-9.svg', color: '#ffa500' }, { icon: '/img/hero/animal-6.svg', color: '#68d391' }, { icon: '/img/hero/animal-7.svg', color: '#4d94ff' }] },
  { count: 5, survivalAfter: 130, previewPlayers: [{ icon: '/img/hero/animal-8.svg', color: '#ff4d4d' }, { icon: '/img/hero/animal-9.svg', color: '#ffa500' }, { icon: '/img/hero/animal-6.svg', color: '#68d391' }, { icon: '/img/hero/animal-7.svg', color: '#4d94ff' }, { icon: '/img/hero/animal-10.svg', color: '#b06ee6' }] }
    ];
  }
});



const startGame = (count) => {
  router.push(`/${count}/play/${selectedMap.value}`);
};
</script>

<style scoped>
.lobby-container {
  min-height: 100vh;
  background-color: #1a1d21; 
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: white;
  position: relative;
  overflow: hidden;
}

/* Фон без изменений */
.liquid-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.08;
  animation: float 20s infinite alternate;
}
.blob-1 { width: 500px; height: 500px; background: #4d94ff; top: -10%; left: -10%; }
.blob-2 { width: 600px; height: 600px; background: #20a698; bottom: -10%; right: -10%; }

@keyframes float {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.lobby-header { text-align: center; margin-bottom: 40px; position: relative; z-index: 1; }

/* Убираем жирность заголовка */
.lobby-title { 
  font-size: 2.4rem; 
  font-weight: 400; /* Обычный вес */
  margin-bottom: 8px; 
  letter-spacing: 1px; /* Добавляем "воздуха" */
}
.lobby-subtitle { 
  color: #99aab5; 
  font-size: 1rem; 
  font-weight: 300; 
  letter-spacing: 0.5px;
}

/* Селектор карт */
.map-selector {
  display: flex;
  background: #25292e;
  padding: 6px;
  border-radius: 14px;
  margin-bottom: 50px;
  border: 1px solid #30353b;
  position: relative;
  z-index: 1;
}

.map-btn {
  background: transparent;
  border: none;
  color: #72767d;
  padding: 10px 28px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 400; /* Убрана жирность */
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.map-btn.active {
  background: #20a698;
  color: white;
}

.btn-content { display: flex; align-items: center; gap: 8px; }
.img-map { width: 20px; }

/* Карточки */
.modes-wrapper { 
  display: flex; 
  gap: 20px; 
  position: relative; 
  z-index: 1;
  align-items: stretch;
}

.mode-card {
  background: #25292e;
  border: 1px solid #30353b;
  border-radius: 24px;
  padding: 40px 24px 24px;
  width: 250px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mode-card:hover {
  transform: translateY(-5px);
  border-color: #20a698;
  background: #2a2f35;
}

/* Аватары */
.player-previews { 
  display: flex; 
  margin-bottom: 30px; 
  height: 52px; 
  align-items: center; 
  justify-content: center;
}

.avatar-stack-item {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px solid #25292e;
  margin-left: -15px;
  background: #1a1d21;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-stack-item:first-child { margin-left: 0; }
.avatar-img { width: 34px; height: 34px; }

/* Инфо */
.mode-info { 
  text-align: center; 
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.mode-name { 
  font-size: 18px; 
  font-weight: 400; /* Убрана жирность */
  margin-bottom: 15px; 
  letter-spacing: 0.5px;
}

.survival-badge {
  font-size: 12px;
  color: #99aab5;
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 22px;
  border-radius: 16px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 300; /* Легкий текст */
}

.select-button {
  background: #20a698;
 border: none;
  color: white;
  /* Увеличиваем вертикальный padding для высоты (16px) */
      padding: 10px 30px;
  border-radius: 12px;
  font-weight: 400;
  width: 100%; /* Растягиваем на всю ширину wrapper'а */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  letter-spacing: 2px;
  font-size: 16px;
}

.button-wrapper {
  width: 100%;
  padding: 0 4px; /* Небольшой отступ от внутренних стенок карточки */
  box-sizing: border-box;
  margin-top: auto; /* Выталкивает кнопку максимально вниз */
}

.mode-card:hover .select-button {
  background: #20a698;
}

.btn-text {
  transition: transform 0.3s ease;
}

.mode-card:hover .btn-text {
  transform: translateX(-12px);
}

.arrow-container {
  position: absolute;
  right: 20px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  display: flex;
}

.mode-card:hover .arrow-container {
  opacity: 1;
  transform: translateX(0);
}

.arrow-svg { width: 18px; height: 18px; }


.selector-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.selector-label {
  font-size: 0.7rem;
  color: #5d6269;
  letter-spacing: 3px;
  font-weight: 400;
  text-transform: uppercase;
}

.mb-label{
  margin-bottom: 20px;
}

@media (max-width: 900px) {
  .modes-wrapper { flex-wrap: wrap; justify-content: center; }
}
</style>