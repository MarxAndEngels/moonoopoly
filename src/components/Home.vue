<template>
  <div class="lobby-container">
    <h1 class="lobby-title">Выберите количество игроков</h1>
    
    <div class="modes-wrapper">
      <div 
        v-for="mode in gameModes" 
        :key="mode.count" 
        class="mode-card"
        @click="startGame(mode.count)"
      >
        <div class="player-previews">
          <div 
            v-for="(player, index) in mode.previewPlayers" 
            :key="index"
            class="avatar-circle"
            :style="{ borderColor: player.color }"
          >
            <span class="avatar-icon"><img class="avatar-icon-img" :src="player.icon" alt="avatar"></span>
          </div>
        </div>
        
       <div class="mode-info">
  <h2 class="mode-name">Игроков: {{ mode.count }}</h2>
  <!-- <p class="mode-desc">Классическая монополия</p> -->
  <p class="mode-desc">💀 Режим выживания на {{ mode.survivalAfter }} ходу</p>
</div>
        
        <button class="select-button">ВЫБРАТЬ</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Данные для карточек выбора
const gameModes = [
  { 
    count: 2, 
    survivalAfter: 100,
    previewPlayers: [
      { icon: '/img/hero/animal-1.svg', color: '#ff4d4d' },
      { icon: '/img/hero/animal-4.svg', color: '#ffa500' }
    ]
  },
  { 
    count: 3, 
    survivalAfter: 150,
    previewPlayers: [
      { icon: '/img/hero/animal-1.svg', color: '#ff4d4d' },
      { icon: '/img/hero/animal-4.svg', color: '#ffa500' },
      { icon: '/img/hero/animal-3.svg', color: '#68d391' }
    ]
  },
  { 
    count: 4, 
    survivalAfter: 180,
    previewPlayers: [
      { icon: '/img/hero/animal-1.svg', color: '#ff4d4d' },
      { icon: '/img/hero/animal-4.svg', color: '#ffa500' },
      { icon: '/img/hero/animal-3.svg', color: '#68d391' },
      { icon: '/img/hero/animal-2.svg', color: '#4d94ff' }
    ]
  },
  { 
    count: 5, 
    survivalAfter: 190,
    previewPlayers: [
      { icon: '/img/hero/animal-1.svg', color: '#ff4d4d' },
      { icon: '/img/hero/animal-4.svg', color: '#ffa500' },
      { icon: '/img/hero/animal-3.svg', color: '#68d391' },
      { icon: '/img/hero/animal-2.svg', color: '#4d94ff' },
      { icon: '/img/hero/animal-5.svg', color: '#b06ee6' }
    ]
  }
];

const startGame = (count) => {
  // Переход на страницу игры с передачей количества игроков в параметрах
  router.push(`/${count}/play`);
};
</script>

<style scoped>
.lobby-container {
  min-height: 100vh;
  background-color: #121212;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  color: white;
  overflow: hidden; /* Предотвращаем общую прокрутку */
}

.lobby-title {
  margin-bottom: 30px;
  font-size: 1.8rem;
  letter-spacing: 1px;
}

.modes-wrapper {
  display: flex;
  flex-wrap: nowrap; /* Всегда в одну линию */
  gap: 15px;
  max-width: 95vw;
  justify-content: center;
}

.mode-card {
  background: #1e1e1e;
  border-radius: 12px;
  padding: 20px 15px;
  width: 250px; /* Фиксированная ширина, чтобы влезло 4-5 штук */
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #333;
}

.mode-card:hover {
  transform: translateY(-5px);
  background: #252525;
  border-color: #444;
}

.player-previews {
  display: flex;
  flex-wrap: wrap; /* Если иконок много, они перенесутся внутри карточки */
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
  min-height: 80px; /* Чтобы карточки были одной высоты */
  align-items: center;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
  font-size: 18px;
}

.mode-info {
  text-align: center;
  margin-bottom: 15px;
}

.mode-name {
  font-size: 1.1rem;
  margin: 0;
}

.mode-desc {
  color: #777;
  font-size: 0.75rem;
  margin: 5px 0 0;
}

.select-button {
  background: #4d94ff;
  border: none;
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.7rem;
  cursor: pointer;
  width: 100%;
}

.avatar-icon{
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-icon-img{
  width: 30px;
  height: auto;
}

.survival-badge {
  margin-top: 12px;
  background: rgba(231, 76, 60, 0.1); /* Прозрачный красный */
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.7rem;
  color: #e74c3c;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.skull-icon {
  font-size: 0.9rem;
  filter: drop-shadow(0 0 2px #e74c3c);
}

/* Эффект при наведении на карточку */
.mode-card:hover .survival-badge {
  background: rgba(231, 76, 60, 0.2);
  border-color: #e74c3c;
}
/* Адаптив для маленьких экранов */
@media (max-width: 900px) {
  .modes-wrapper {
    flex-wrap: wrap;
    overflow-y: auto;
  }
}
</style>