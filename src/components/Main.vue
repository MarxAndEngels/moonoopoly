<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const playerCount = computed(() => {
  const count = parseInt(route.params.count);
  return isNaN(count) ? 2 : count;
});

const phrases = ref([
        "Ваша стратегия безупречна, осталось только бросить кости.",
   "Ваш ход должен быть легендарным. Удача любит смелых — испытайте её!",
  "Все взгляды прикованы к вашему броску. Удача любит смелых — испытайте её!",
  "Пора напомнить соперникам, кто здесь настоящий хозяин поля.",
   "Ваш ход должен быть легендарным. Удача любит смелых — испытайте её!",
      "Бизнес не терпит пауз — время расширять влияние!",
      "Ваш ход — их главная проблема в этом раунде.",
  "Все взгляды прикованы к вашему броску. Удача любит смелых — испытайте её!",
        "Настало время для решительных действий! Вперед, к новым победам.",
      "Фортуна сегодня явно на вашей стороне, не подведите её!",
  "Готовы сорвать куш в этом раунде? Вперед, мы в Вас верим!",
  "Забудьте о страхе — сегодня фортуна целует только смелых!",
        "Настало время для решительных действий! Вперед, к новым победам.",
      "Кубики уже заряжены на успех, просто отпустите их.",
      "Вперед, к вершинам! Пусть цифры на кубиках вас не подведут.",
  "Ваша бизнес-империя ждет Вашего шага...",
])

const change = ref([
  {
    title: 'Вы заняли второе место в конкурсе красоты. Получите 1000к',
    type: 'plus',
    count: 1000
  },
  {
    title: 'Вы наследуете 1000к',
    type: 'plus',
    count: 1000
  },

])

const currentPhrase = ref(phrases.value[0]);

const setRandomPhrase = () => {
  const randomIndex = Math.floor(Math.random() * phrases.value.length);
  currentPhrase.value = phrases.value[randomIndex];
};

const players = ref([
  { id: 1, name: 'Игрок 1', balance: '5500', color: '#ff4d4d', avatar: '👨‍🦰', position: 0, active: true, incomingTrade: null,isInJail: false, jailTurns: 0 },
  { id: 2, name: 'Игрок 2', balance: '5000', color: '#4d94ff', avatar: '👤', position: 0, active: false, incomingTrade: null ,isInJail: false, jailTurns: 0
   },
  { id: 3, name: 'Игрок 3', balance: '5000', color: '#68d391', avatar: '🤴', position: 0, active: false, incomingTrade: null,isInJail: false, jailTurns: 0
   },
  { id: 4, name: 'Игрок 4', balance: '5000', color: '#b06ee6', avatar: '🧥', position: 0, active: false, incomingTrade: null,isInJail: false, jailTurns: 0 }
]);


// const currentStatus = computed(() => {
//   const p = currentPlayer.value;
//   if (!p || !p.phrases) return "Ваш ход!";
  
//   // Привязываем выбор фразы к ID игрока, чтобы она не менялась 
//   // при каждом обновлении интерфейса, а была стабильной весь ход
//   const phraseIndex = p.id % p.phrases.length; 
//   return p.phrases[phraseIndex];
// });

const activePlayers = computed(() => players.value.slice(0, playerCount.value));
const currentPlayer = computed(() => activePlayers.value.find(p => p.active) || activePlayers.value[0]);
const logs = ref([{ id: 1, text: 'Игра началась! Первым ходит ' + activePlayers.value[0].name, type: 'system' }]);

const logContainer = ref(null); // Ссылка на DOM-элемент

const addLog = (text) => {
  logs.value.push({ id: Date.now(), text });
  if (logs.value.length > 10) logs.value = logs.value.slice(-10);
};

const getCellBg = (cell) => {
  if (cell.owner) {
    const owner = activePlayers.value.find(p => p.id === cell.owner);
    return owner ? owner.color : '#fff';
  }
  return '#fff';
};

const upgradedThisTurn = ref([]);

// --- ЛОГИКА ДОГОВОРА (TRADE) ---
const isTradeOpen = ref(false);
const tradeData = ref({ target: null, myOffer: [], theirOffer: [],myMoney: 0, theirMoney: 0 });

const openTrade = (player) => {
  if (parseInt(currentPlayer.value.balance) < 0) {
    alert("Банкроты не могут участвовать в сделках!");
    return;
  }
  if (player.id === currentPlayer.value.id) {
    return; // Просто выходим, либо можно добавить alert("Нельзя торговать с самим собой");
  }
  // НОВАЯ ПРОВЕРКА: Есть ли у игрока хоть какое-то имущество?
  const hasProperty = steps.value.some(step => step.owner === currentPlayer.value.id);
  
  if (!hasProperty) {
    alert("Вы не можете предлагать сделки, пока у вас нет ни одного выкупленного поля.");
    return;
  }

  // 1. ПРОВЕРКА: Если у МЕНЯ (отправителя) уже есть активное ИСХОДЯЩЕЕ предложение
  if (currentPlayer.value.outgoingTrade) {
    alert("У вас уже есть активное предложение. Дождитесь ответа.");
    return;
  }

  // 2. ПРОВЕРКА: Если у ТОГО, кому предлагаем, уже есть ВХОДЯЩЕЕ предложение
  if (player.incomingTrade) {
    alert(`${player.name} сейчас рассматривает другое предложение.`);
    return;
  }

  // 3. ПРОВЕРКА: Если ТОТ, кому мы хотим предложить, сам отправил офер
  if (player.outgoingTrade) {
    alert(`${player.name} сейчас сам делает предложение другому игроку.`);
    return;
  }

  tradeData.value = { target: player, myOffer: [], theirOffer: [], myMoney: 0, theirMoney: 0 };
  isTradeOpen.value = true;
};

const closeTrade = () => { isTradeOpen.value = false; };

const togglePropertyInTrade = (cell) => {
  if (cell.owner === currentPlayer.value.id) {
    const idx = tradeData.value.myOffer.findIndex(i => i.id === cell.id);
    if (idx > -1) {
      tradeData.value.myOffer.splice(idx, 1);
    } else {
      // ПРОВЕРКА: Лимит 2 элемента с моей стороны
      if (tradeData.value.myOffer.length < 2) {
        tradeData.value.myOffer.push(cell);
      } else {
        alert("Вы не можете предложить больше 2-х элементов со своей стороны");
      }
    }
  } else if (cell.owner === tradeData.value.target.id) {
    const idx = tradeData.value.theirOffer.findIndex(i => i.id === cell.id);
    if (idx > -1) {
      tradeData.value.theirOffer.splice(idx, 1);
    } else {
      // ПРОВЕРКА: Лимит 2 элемента со стороны оппонента
      if (tradeData.value.theirOffer.length < 2) {
        tradeData.value.theirOffer.push(cell);
      } else {
        alert("Вы не можете запросить больше 2-х элементов у оппонента");
      }
    }
  }
};

// --- ЛОГИКА ПРОСМОТРА КАРТОЧЕК ---
const inspectedProperty = ref(null);
const propertyToBuy = ref(null);

const activeDisplayCard = computed(() => propertyToBuy.value || inspectedProperty.value);

const handleCellClick = (cell) => {
  // Если открыт обмен, добавляем клетку в сделку вместо осмотра
  if (isTradeOpen.value) {
    if (cell.owner) togglePropertyInTrade(cell);
    return;
  }
  if (cell.price) {
    inspectedProperty.value = cell;
  }
};

const closeInspect = () => {
  inspectedProperty.value = null;
};

const buyProperty = () => {
  const player = currentPlayer.value;
  const property = propertyToBuy.value;
  
  if (parseInt(player.balance) >= parseInt(property.price)) {
    player.balance = (parseInt(player.balance) - parseInt(property.price)).toString();
    property.owner = player.id;
    addLog(`${player.name} купил ${property.name} за ${property.price}k`);
    propertyToBuy.value = null;
    nextTurn(); 
  } else {
    alert("Недостаточно средств!");
  }
};

const skipBuy = () => {
  addLog(`${currentPlayer.value.name} отказался от покупки ${propertyToBuy.value.name}`);
  propertyToBuy.value = null;
  nextTurn();
};

const playPoliceSound = () => {
  const audio = new Audio('/audio/ment.mp3'); 
  audio.volume = 0.4; // Громкость от 0 до 1
  audio.play().catch(e => console.log("Ошибка воспроизведения:", e));
};

const nextTurn = () => {
  if (checkWinner()) return;
  
  const actor = currentPlayer.value;

  upgradedThisTurn.value = [];

  // --- ЛОГИКА АННУЛИРОВАНИЯ ДОГОВОРА ---
  // Если у игрока, который сейчас заканчивает ход, висит входящий договор
  if (actor.incomingTrade) {
    const sender = activePlayers.value.find(p => p.id === actor.incomingTrade.senderId);
    
    // Добавляем лог о том, что договор просрочен
    addLog(`Договор для ${actor.name} аннулирован (ход завершен)`);
    
    // Очищаем данные у обоих
    actor.incomingTrade = null;
    if (sender) sender.outgoingTrade = null;
  }
  // -------------------------------------

  const currentIndex = activePlayers.value.indexOf(actor);
  actor.active = false;

  // Ищем следующего игрока, у которого баланс >= 0
  let nextIndex = (currentIndex + 1) % activePlayers.value.length;
  let attempts = 0;

  // Цикл ищет живого игрока, но остановится, если все банкроты (на всякий случай)
  while (parseInt(activePlayers.value[nextIndex].balance) < 0 && attempts < activePlayers.value.length) {
    addLog(`${activePlayers.value[nextIndex].name} банкрот и пропускает ход`);
    nextIndex = (nextIndex + 1) % activePlayers.value.length;
    attempts++;
  }

  const nextPlayer = activePlayers.value[nextIndex];
  nextPlayer.active = true;
  addLog(`Очередь игрока: ${nextPlayer.name}`);

  setRandomPhrase();
  isRolling.value = false;
};

const isRolling = ref(false);
const diceStyles = ref([{ transform: 'rotateX(0deg) rotateY(0deg)' }, { transform: 'rotateX(0deg) rotateY(0deg)' }]);

const rotations = {
  1: { x: 0, y: 0 }, 2: { x: 0, y: -90 }, 3: { x: 0, y: -180 },
  4: { x: 0, y: 90 }, 5: { x: 90, y: 0 }, 6: { x: -90, y: 0 }
};

const moveSmoothly = async (player, totalSteps) => {
  for (let i = 0; i < totalSteps; i++) {
    const nextPosition = (player.position + 1) % 40;
    
    // Проверка: если мы переходим с 39 на 0 — это прохождение круга
    if (player.position === 39 && nextPosition === 0) {
      const bonus = 1000;
      player.balance = (parseInt(player.balance) + bonus).toString();
      addLog(`${player.name} прошел круг и получил ${bonus}k!`);
    }

    player.position = nextPosition;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
};

const rollDice = async () => {
  if (isRolling.value || parseInt(currentPlayer.value.balance) < 0) return;
  const actor = currentPlayer.value;
  isRolling.value = true; 
  const r1 = Math.floor(Math.random() * 6) + 1;
  const r2 = Math.floor(Math.random() * 6) + 1;
  const total = r1 + r2;
  addLog(`${actor.name} выбрасывает ${total}`);
  
  const extraSpin = () => (Math.floor(Math.random() * 3) + 3) * 360;
  diceStyles.value = [
    { transform: `rotateX(${rotations[r1].x + extraSpin()}deg) rotateY(${rotations[r1].y + extraSpin()}deg)` },
    { transform: `rotateX(${rotations[r2].x + extraSpin()}deg) rotateY(${rotations[r2].y + extraSpin()}deg)` }
  ];
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  await moveSmoothly(actor, total);
  
  const currentStep = steps.value.find(s => s.id === actor.position);
  addLog(`${actor.name} остановился на поле "${currentStep.name}"`);
 //арестован за отмывание денег и отправляется в полицейский участок!
 //должен оплатить расходы на 
 // остановился на поле подоходный налог и должен заплатить банку 2000
 // остановился на поле налог на роскошь и должен заплатить банку 2000
  if (currentStep.type === 'jail') {
    addLog(`${actor.name} просто посетил полицейский участок и двинулся дальше!`);
  }
  if (currentStep.type === 'tax') {
  const taxAmount = 2000;
  addLog(`${actor.name} оплачивает налог на доходы в размере ${taxAmount}k`);
  processTax(actor, taxAmount);
  return; 
}
// --- 2. ЛОГИКА: НАЛОГ НА РОСКОШЬ (тип tax2) ---
// if (currentStep.type === 'tax2') {
//   const luxuryTaxAmount = 1000;
//   addLog(`${actor.name} оплачивает нналог на роскошь в размере ${luxuryTaxAmount}k`);
//   processTax(actor, luxuryTaxAmount);
//   return;
// }
  
  if (currentStep.type === 'park') {
   addLog(`Время отдыха! Вы припарковались в удачном месте. Наслаждайтесь тишиной, пока остальные тратят деньги на аренду.`);
  }
  if (currentStep.type === 'car') {
    addLog(`${actor.name} арестован полицией и отправляется в полицейский участок!`);
    // Небольшая задержка перед "телепортацией", чтобы игрок понял, что произошло
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    playPoliceSound();
    actor.position = 10; // Перемещаем на ID 10 (Jail)
    actor.isInJail = true; // Активируем статус тюрьмы
    actor.jailTurns = 3;   // Ставим счетчик на 3 хода
    nextTurn();
    return; // Выходим из функции, чтобы не срабатывали проверки ниже
  }

  if (currentStep.type === 'property') {
    if (!currentStep.owner) {
      propertyToBuy.value = currentStep;
    } else if (currentStep.owner !== actor.id) {
      const owner = activePlayers.value.find(p => p.id === currentStep.owner);
      const rentAmount = currentStep.rent[currentStep.level - 1];

      // --- ЛОГИКА ПРОДАЖИ ПРИ НЕХВАТКЕ ---
      while (parseInt(actor.balance) < rentAmount) {
        const myProperties = steps.value.filter(s => s.owner === actor.id);
        if (myProperties.length === 0) break;

        let propertyToSell = myProperties.find(p => p.level === 1);
        if (!propertyToSell) propertyToSell = myProperties[0];

        const sellPrice = propertyToSell.sellPrice[propertyToSell.level - 1];
        actor.balance = (parseInt(actor.balance) + sellPrice).toString();
        
        addLog(`У ${actor.name} не хватило денег! Авто-продажа ${propertyToSell.name} за ${sellPrice}k`);
        propertyToSell.owner = null;
        propertyToSell.level = 1;
      }

      // --- РАСЧЕТ И БАНКРОТСТВО ---
      const finalActorBalance = parseInt(actor.balance);

      if (finalActorBalance < rentAmount) {
        const lastMoney = Math.max(0, finalActorBalance);
        owner.balance = (parseInt(owner.balance) + lastMoney).toString();
        
        handleBankrupt(actor); 
      } else {
        actor.balance = (finalActorBalance - rentAmount).toString();
        owner.balance = (parseInt(owner.balance) + rentAmount).toString();
        addLog(`${actor.name} заплатил ${rentAmount}k аренды игроку ${owner.name}`);
        nextTurn();
      }
    } else {
      addLog(`${actor.name} отдыхает на своей территории`);
      nextTurn();
    }
  } else {
    nextTurn();
  }
};

const steps = ref([
  { id: 0, name: 'Start', type: 'corner', logo: '/img/start.png' },
  { id: 1, name: 'Nike', type: 'property', color: '#e7a5e7', price: '600', sellPrice: [300, 900, 2400, 3900, 5400], rent: [50, 600, 1800, 2400, 3000], level: 1, logo: '/img/nike.png', description: 'Спортивная одежда, обувь и аксессуары', country: 'США', countryImg: '/img/flags/usa.svg', relations: 1, owner: 1 },
  { id: 2, name: '?', type: 'tax', logo: '/img/question.png' },
  { id: 3, name: 'Adidas', type: 'property', color: '#e7a5e7', price: '600', sellPrice: [300, 900, 2400, 3900, 5400], rent: [50, 600, 1800, 2400, 3000], level: 1, logo: '/img/ADIDAS.png', description: 'Спортивная одежда, обувь и аксессуары', country: 'Германия', countryImg: '/img/flags/germany.svg', relations: 1, owner: 1},
  { id: 4, name: 'Налог на доходы', type: 'tax', logo: '/img/money.png'},
  { id: 5, name: 'Microsoft', type: 'property', color: '#d31a2c', price: '3400', sellPrice: [1700, 2300, 3800, 5300, 6800], rent: [283, 3400, 10200, 13600, 17000], level: 1, logo: '/img/MICROSOFT.png', description: 'Технологические монополисты, владеющие данными. Цифровые услуги, интернет-сервисы', country: 'США', countryImg: '/img/flags/usa.svg', relations: 10 },
  { id: 6, name: 'Facebook', type: 'property', color: '#0d6efd', price: '2000', sellPrice: [1000, 1600, 3100, 4600, 6100], rent: [166, 2000, 6000, 8000, 10000], level: 1, logo: '/img/FACEBOOK.png', description: 'Социальные интернет-сервисы', country: 'США', countryImg: '/img/flags/usa.svg', relations: 4 },
  { id: 7, name: '?', type: 'tax', logo: '/img/question.png' },
  { id: 8, name: 'X', type: 'property', color: '#0d6efd', price: '2000', sellPrice: [1000, 1600, 3100, 4600, 6100], rent: [166, 2000, 6000, 8000, 10000], level: 1, logo: '/img/X.png', description: 'Социальные интернет-сервисы', country: 'США', countryImg: '/img/flags/usa.svg', relations: 4 },
  { id: 9, name: 'Telegram', type: 'property', color: '#0d6efd', price: '2000', sellPrice: [1000, 1600, 3100, 4600, 6100], rent: [166, 2000, 6000, 8000, 10000], level: 1, logo: '/img/TELEGRAM.png', description: 'Социальные интернет-сервисы', relations: 4 },
  { id: 10, name: 'Полицеский участок', type: 'jail', logo: '/img/jail.svg' },
  { id: 11, name: 'Coca-Cola', type: 'property', color: '#54d9cf', price: '1400', sellPrice: [700, 1300, 2800, 4300, 5800], rent: [116, 1400, 4200, 5600, 7000], level: 1, logo: '/img/cc.png', description: 'Газированные безалкогольные напитки', country: 'США', countryImg: '/img/flags/usa.svg', relations: 3 },
  { id: 12, name: 'McDonald’s', type: 'property', color: '#c35831', price: '1300', sellPrice: [650, 1250, 2750, 4250, 5750], rent: [108, 1300, 3900, 5200, 6500], level: 1, logo: '/img/mac.png', description: 'Общественное питание', country: 'США', countryImg: '/img/flags/usa.svg', relations: 2 },
  { id: 13, name: 'Pepsi', type: 'property', color: '#54d9cf', price: '1400', sellPrice: [700, 1300, 2800, 4300, 5800], rent: [116, 1400, 4200, 5600, 7000], level: 1, logo: '/img/PEPSI.png', description: 'Газированные безалкогольные напитки', country: 'США', countryImg: '/img/flags/usa.svg', relations: 3 },
  { id: 14, name: 'Dr Pepper', type: 'property', color: '#54d9cf', price: '1400', sellPrice: [700, 1300, 2800, 4300, 5800], rent: [116, 1400, 4200, 5600, 7000], level: 1, logo: '/img/dr.png', description: 'Газированные безалкогольные напитки', country: 'США', countryImg: '/img/flags/usa.svg', relations: 3 },
  { id: 15, name: 'Google', type: 'property', color: '#d31a2c', price: '3400', sellPrice: [1700, 2300, 3800, 5300, 6800], rent: [283, 3400, 10200, 13600, 17000], level: 1, logo: '/img/GOOGLE.png', description: 'Технологические монополисты, владеющие данными. Цифровые услуги, интернет-сервисы', country: 'США', countryImg: '/img/flags/usa.svg', relations: 10 },
  { id: 16, name: 'Visa', type: 'property', color: '#ffcc00', price: '2200', sellPrice: [1100, 1700, 3200, 4700, 6200], rent: [183, 2200, 6600, 8800, 11000], level: 1, logo: '/img/VISA.png', description: 'Платежные системы', country: 'США', countryImg: '/img/flags/usa.svg', relations: 5 },
  { id: 17, name: '?', type: 'tax', logo: '/img/question.png' },
  { id: 18, name: 'Mastercard', type: 'property', color: '#ffcc00', price: '2200', sellPrice: [1100, 1700, 3200, 4700, 6200], rent: [183, 2200, 6600, 8800, 11000], level: 1, logo: '/img/MASTERCARD.png', description: 'Платежные системы', country: 'США', countryImg: '/img/flags/usa.svg', relations: 5 },
  { id: 19, name: 'Мир', type: 'property', color: '#ffcc00', price: '2200', sellPrice: [1100, 1700, 3200, 4700, 6200], rent: [183, 2200, 6600, 8800, 11000], level: 1, logo: '/img/mir.png', description: 'Платежные системы', country: 'Россия', countryImg: '/img/flags/rus.svg', relations: 5 },
  { id: 20, name: 'Бесплатная парковка', type: 'park', logo: '/img/park.svg' },
  { id: 21, name: 'Toyota', type: 'property', color: '#198754', price: '2600', sellPrice: [1300, 1900, 3400, 4900, 6400], rent: [216, 2600, 7800, 10400, 13000], level: 1, logo: '/img/TOYOTA.png', description: 'Автомобили', country: 'Япония', countryImg: '/img/flags/japan.svg', relations: 6 },
  { id: 22, name: '?', type: 'tax', logo: '/img/question.png' },
  { id: 23, name: 'Volkswagen', type: 'property', color: '#198754', price: '2600', sellPrice: [1300, 1900, 3400, 4900, 6400], rent: [216, 2600, 7800, 10400, 13000], level: 1, logo: '/img/VOLKSWAGEN.png', description: 'Автомобили', country: 'Германия', countryImg: '/img/flags/germany.svg', relations: 6 },
  { id: 24, name: 'Lada', type: 'property', color: '#198754', price: '2600', sellPrice: [1300, 1900, 3400, 4900, 6400], rent: [216, 2600, 7800, 10400, 13000], level: 1, logo: '/img/LADA.png', description: 'Автомобили', country: 'Россия', countryImg: '/img/flags/rus.svg', relations: 6 },
  { id: 25, name: 'Яндекс', type: 'property', color: '#d31a2c', price: '3400', sellPrice: [1700, 2300, 3800, 5300, 6800], rent: [283, 3400, 10200, 13600, 17000], level: 1, logo: '/img/yandex.png', description: 'Технологические монополисты, владеющие данными. Цифровые услуги, интернет-сервисы', country: 'Россия', countryImg: '/img/flags/rus.svg', relations: 10 },
  { id: 26, name: 'Icbc', type: 'property', color: '#93bbf6', price: '2800', sellPrice: [1400, 2000, 3500, 5000, 6500], rent: [233, 2800, 8400, 11200, 14000], level: 1, logo: '/img/ICBC.png', description: 'Банки', country: 'Китай', countryImg: '/img/flags/china.svg', relations: 7 },
  { id: 27, name: 'Ccb', type: 'property', color: '#93bbf6', price: '2800', sellPrice: [1400, 2000, 3500, 5000, 6500], rent: [233, 2800, 8400, 11200, 14000], level: 1, logo: '/img/CCB.png', description: 'Банки', country: 'Китай', countryImg: '/img/flags/china.svg', relations: 7 },
  { id: 28, name: 'Kfc', type: 'property', color: '#c35831', price: '1300', sellPrice: [650, 1250, 2750, 4250, 5750], rent: [108, 1300, 3900, 5200, 6500], level: 1, logo: '/img/kfc.png', description: 'Общественное питание', country: 'США', countryImg: '/img/flags/usa.svg', relations: 2 },
  { id: 29, name: 'Сбербанк', type: 'property', color: '#93bbf6', price: '2800', sellPrice: [1400, 2000, 3500, 5000, 6500], rent: [233, 2800, 8400, 11200, 14000], level: 1, logo: '/img/sber.png', description: 'Банки', country: 'Россия', countryImg: '/img/flags/rus.svg', relations: 7 },
  { id: 30, name: 'Злой полицейский', type: 'car', logo: '/img/police1.svg' },
  { id: 31, name: 'Apple', type: 'property', color: '#a54bef', price: '3000', sellPrice: [1500, 2100, 3600, 5100, 6600], rent: [250, 3000, 9000, 12000, 15000], level: 1, logo: '/img/APPLE.png', description: 'Электроника высокого уровня', country: 'США', countryImg: '/img/flags/usa.svg', relations: 8 },
  { id: 32, name: 'Samsung', type: 'property', color: '#a54bef', price: '3000', sellPrice: [1500, 2100, 3600, 5100, 6600], rent: [250, 3000, 9000, 12000, 15000], level: 1, logo: '/img/SAMSUNG.png', description: 'Электроника высокого уровня', country: 'Корея', countryImg: '/img/flags/korea.svg', relations: 8 },
  { id: 33, name: '?', type: 'tax', logo: '/img/question.png' },
  { id: 34, name: 'Xiaomi', type: 'property', color: '#a54bef', price: '3000', sellPrice: [1500, 2100, 3600, 5100, 6600], rent: [250, 3000, 9000, 12000, 15000], level: 1, logo: '/img/xiaomi.png', description: 'Электроника высокого уровня', country: 'Китай', countryImg: '/img/flags/china.svg', relations: 8 },
  { id: 35, name: 'Saudi Aramco', type: 'property', color: '#292929', price: '3300', sellPrice: [1650, 2250, 3750, 5250, 6750], rent: [275, 3300, 9900, 13200, 16500], level: 1, logo: '/img/sa.png', description: 'Добыча, переработка и экспорт ресурсов', country: 'Саудовская Аравия', countryImg: '/img/flags/sa.svg', relations: 9 },
  { id: 36, name: 'Налог на роскошь', type: 'tax2', logo: '/img/diamond.png' },
  { id: 37, name: 'Shell', type: 'property', color: '#292929', price: '3300', sellPrice: [1650, 2250, 3750, 5250, 6750], rent: [275, 3300, 9900, 13200, 16500], level: 1, logo: '/img/shell.png', description: 'Добыча, переработка и экспорт ресурсов', country: 'Великобритания', countryImg: '/img/flags/uk.svg', relations: 9 },
  { id: 38, name: '?', type: 'tax', logo: '/img/question.png' },
  { id: 39, name: 'Лукойл', type: 'property', color: '#292929', price: '3300', sellPrice: [1650, 2250, 3750, 5250, 6750], rent: [275, 3300, 9900, 13200, 16500], level: 1, logo: '/img/l.png', description: 'Добыча, переработка и экспорт ресурсов', country: 'Россия', countryImg: '/img/flags/rus.svg', relations: 9 },
]);

const handleBankrupt = (actor) => {
  // Устанавливаем статус банкрота
        actor.balance = "-1"; 
        
        // Освобождаем оставшееся имущество
        steps.value.forEach(s => {
          if (s.owner === actor.id) {
            s.owner = null;
            s.level = 1;
          }
        });

        addLog(`💥 ${actor.name} обанкротился и покидает поле!`);
        nextTurn();
}

const processTax = (actor, amount) => {
  // 1. Считаем, может ли игрок в принципе оплатить налог (деньги + всё имущество)
  const myProperties = steps.value.filter(s => s.owner === actor.id);
  const totalAssets = myProperties.reduce((sum, p) => sum + parseInt(p.sellPrice[p.level - 1]), 0);
  const totalWealth = parseInt(actor.balance) + totalAssets;

  if (totalWealth < amount) {
    // Сценарий мгновенного банкротства (даже если всё продаст — не хватит)
    addLog(`У ${actor.name} нет средств на оплату налогов! Банкротство.`);
    handleBankrupt(actor); // Используем общую функцию очистки игрока
    return;
  }

  // 2. Если активов хватает, запускаем процесс продажи (ваш цикл while)
  while (parseInt(actor.balance) < amount) {
    const currentProps = steps.value.filter(s => s.owner === actor.id);
    // Продаем самое дешевое (уровень 1) в первую очередь
    const propertyToSell = currentProps.sort((a, b) => a.level - b.level)[0];
    
    const sellPrice = parseInt(propertyToSell.sellPrice[propertyToSell.level - 1]);
    actor.balance = (parseInt(actor.balance) + sellPrice).toString();
    
    addLog(`Налоговая служба: ${actor.name} продал ${propertyToSell.name} за ${sellPrice}k`);
    
    propertyToSell.owner = null;
    propertyToSell.level = 1;
  }

  // 3. Финальное списание
  actor.balance = (parseInt(actor.balance) - amount).toString();
  addLog(`Налог ${amount}k оплачен. Текущий баланс ${actor.name}: ${actor.balance}k`);
  
  // 4. После налога ход всегда завершается
  nextTurn();
};

const getPropertyFullValue = (cell) => {
  if (!cell || !cell.price) return 0;
  // Базовая цена + цена продажи для текущего уровня
  const basePrice = parseInt(cell.price);
  if(cell.level <= 1) {
    return basePrice
  }else if(cell.level == 2){
  return basePrice + 600;
  }else{
  return basePrice + 600 + (1500 * (cell.level-2));
  }
};

const topRow = computed(() => steps.value.slice(0, 11)); 
const rightCol = computed(() => steps.value.slice(11, 20)); 
const bottomRow = computed(() => steps.value.slice(20, 31)); 
const leftCol = computed(() => steps.value.slice(31, 40));

const scrollToBottom = async () => {
  await nextTick(); // Ждем, пока Vue обновит DOM после добавления лога
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
};

// Следим за изменениями в массиве logs
watch(logs, () => {
  scrollToBottom();
}, { deep: true });

const cancelTradeState = (receiver, sender) => {
  receiver.incomingTrade = null;
  if (sender) sender.outgoingTrade = null;
};

// Отправить предложение
const sendTradeOffer = () => {
  if (!tradeData.value.target) return;

  const offer = {
    senderId: currentPlayer.value.id,
    senderName: currentPlayer.value.name,
    myOfferIds: tradeData.value.myOffer.map(c => c.id),
    theirOfferIds: tradeData.value.theirOffer.map(c => c.id),
    myMoney: parseInt(tradeData.value.myMoney) || 0, // Добавлено
    theirMoney: parseInt(tradeData.value.theirMoney) || 0 // Добавлено
  };

  // Записываем получателю во входящие
  tradeData.value.target.incomingTrade = offer;
  
  // Записываем отправителю в исходящие (чтобы он не мог слать еще)
  currentPlayer.value.outgoingTrade = {
    targetId: tradeData.value.target.id
  };

  addLog(`Предложение отправлено игроку ${tradeData.value.target.name}`);
  closeTrade();
};

// Принять сделку
const acceptTrade = (player) => {
const trade = player.incomingTrade;
  const sender = activePlayers.value.find(p => p.id === trade.senderId);
  
  if (!sender) return;

  // 1. ПРОВЕРКА ВЛАДЕНИЯ ОБЪЕКТАМИ
  // Проверяем, принадлежат ли всё еще предложенные поля отправителю
  const senderStillOwnsEverything = trade.myOfferIds.every(id => {
    const cell = steps.value.find(s => s.id === id);
    return cell && cell.owner === sender.id;
  });

  // Проверяем, принадлежат ли всё еще запрашиваемые поля получателю
  const receiverStillOwnsEverything = trade.theirOfferIds.every(id => {
    const cell = steps.value.find(s => s.id === id);
    return cell && cell.owner === player.id;
  });

  if (!senderStillOwnsEverything || !receiverStillOwnsEverything) {
    addLog(`Сделка аннулирована: состав имущества игроков изменился!`);
    cancelTradeState(player, sender);
    return;
  }

  // --- ПРОВЕРКА НАЛИЧИЯ СРЕДСТВ ПЕРЕД ПРИНЯТИЕМ ---
  const senderBalance = parseInt(sender.balance);
  const receiverBalance = parseInt(player.balance);

  // Проверяем, может ли отправитель выплатить обещанное
  if (senderBalance < trade.myMoney) {
    addLog(`Сделка сорвана! У ${sender.name} недостаточно денег.`);
    cancelTradeState(player, sender);
    return;
  }

  // Проверяем, может ли получатель (тот, кто принимает) выплатить обещанное
  if (receiverBalance < trade.theirMoney) {
    addLog(`Сделка сорвана! У ${player.name} недостаточно денег.`);
    cancelTradeState(player, sender);
    return;
  }

  trade.myOfferIds.forEach(id => {
    const cell = steps.value.find(s => s.id === id);
    if (cell) cell.owner = player.id;
  });

  trade.theirOfferIds.forEach(id => {
    const cell = steps.value.find(s => s.id === id);
    if (cell) cell.owner = trade.senderId;
  });

  // 2. ПЕРЕВОД ДЕНЕГ (Новое)
  if (sender) {
    // Деньги от отправителя к получателю
    sender.balance = (parseInt(sender.balance) - trade.myMoney).toString();
    player.balance = (parseInt(player.balance) + trade.myMoney).toString();
    
    // Деньги от получателя к отправителю
    player.balance = (parseInt(player.balance) - trade.theirMoney).toString();
    sender.balance = (parseInt(sender.balance) + trade.theirMoney).toString();
  }

  addLog(`${player.name} принял сделку от ${trade.senderName}!`);
  
  // Очищаем данные у обоих
  player.incomingTrade = null;
  if (sender) sender.outgoingTrade = null;
};


// Отклонить сделку
const rejectTrade = (player) => {
  const trade = player.incomingTrade;
  const sender = activePlayers.value.find(p => p.id === trade.senderId);
  
  addLog(`${player.name} отклонил предложение.`);
  cancelTradeState(player, sender);
};

const getTradeItemById = (id) => {
  return steps.value.find(s => s.id === id);
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};

// Переменная для хранения ключа текущего инпута ('myMoney' или 'theirMoney')
const activeKeyboardTarget = ref(null);

// Функция открытия клавиатуры
const toggleKeyboard = (target) => {
  if (activeKeyboardTarget.value === target) {
    activeKeyboardTarget.value = null; // Закрыть, если нажали повторно
  } else {
    activeKeyboardTarget.value = target;
  }
};


// Функция удаления последней цифры
const backspace = () => {
  if (activeKeyboardTarget.value) {
    const valStr = tradeData.value[activeKeyboardTarget.value].toString();
    const newVal = valStr.slice(0, -1);
    tradeData.value[activeKeyboardTarget.value] = newVal === '' ? 0 : parseInt(newVal);
  }
};

// Функция валидации денежного ввода
const validateMoney = (target) => {
  let val = tradeData.value[target].toString();
  
  // 1. Оставляем только цифры (регулярное выражение)
  val = val.replace(/\D/g, '');
  
  // 2. Убираем ведущие нули (кроме случая, когда в строке только "0")
  if (val.length > 1 && val.startsWith('0')) {
    val = val.replace(/^0+/, '');
  }
  
  // 3. Если пусто — ставим 0
  if (!val) {
    tradeData.value[target] = 0;
    return;
  }

  let numVal = parseInt(val);

  // 4. Проверка на лимит баланса
  // Если цель - "мои деньги", берем баланс текущего игрока, иначе - баланс цели сделки
  const maxLimit = target === 'myMoney' 
    ? parseInt(currentPlayer.value.balance) 
    : parseInt(tradeData.value.target.balance);

  if (numVal > maxLimit) {
    numVal = maxLimit;
  }

  tradeData.value[target] = numVal;
};

// Функция ввода цифры
const typeNumber = (num) => {
  if (activeKeyboardTarget.value) {
    const currentVal = tradeData.value[activeKeyboardTarget.value].toString();
    if (currentVal.length < 7) {
      tradeData.value[activeKeyboardTarget.value] = currentVal + num;
      validateMoney(activeKeyboardTarget.value); // Валидируем после ввода
    }
  }
};
const sellToBank = (property) => {
  // Проверяем, что это ход игрока и он владелец
  if (property.owner !== currentPlayer.value.id) return;
  if (!currentPlayer.value.active) {
    alert("Вы можете продавать объекты только в свой ход!");
    return;
  }

    const player = currentPlayer.value;

    const currentLevel = property.level; 
  const priceIndex = currentLevel - 1;
  const finalSellPrice = property.sellPrice[priceIndex];
    
    // Прибавляем деньги к балансу игрока
  currentPlayer.value.balance = (parseInt(currentPlayer.value.balance) + parseInt(finalSellPrice)).toString();

  // Логируем действие
  addLog(`${currentPlayer.value.name} продал ${property.name} за ${finalSellPrice}k`);

  // Сбрасываем данные объекта
  property.owner = null;
  property.level = 1; // Возвращаем на начальный уровень для следующего покупателя
  
  // Закрываем окно осмотра карточки
  if (typeof closeInspect === 'function') closeInspect();
};

const upgradeProperty = (property) => {
  const player = currentPlayer.value;
  
  // 1. Проверка: ход ли этого игрока
  if (!player.active) return;

  // --- НОВАЯ ПРОВЕРКА: Улучшался ли этот объект уже в этот ход? ---
  if (upgradedThisTurn.value.includes(property.id)) {
    alert("Вы уже улучшали этот объект в текущем ходу. Дождитесь следующего хода!");
    return;
  }

  // 2. Проверка: владеет ли игрок ВСЕМИ объектами этой группы (relations)
  const group = steps.value.filter(s => s.relations === property.relations);
  const ownsAll = group.every(s => s.owner === player.id);

  if (!ownsAll) {
    alert("Чтобы улучшать объекты, вы должны владеть всеми карточками этой группы!");
    return;
  }

  // 3. Проверка: не достигнут ли максимальный уровень (5)
  if (property.level >= 5) {
    alert("Достигнут максимальный уровень улучшения!");
    return;
  }

  // 4. Определение стоимости улучшения
  // 1-й апгрейд (до уровня 2) стоит 600, остальные по 1500
  const upgradeCost = property.level === 1 ? 600 : 1500;

  // 5. Проверка баланса
  if (parseInt(player.balance) < upgradeCost) {
    alert("Недостаточно средств для улучшения!");
    return;
  }

  // 6. Проведение транзакции
  player.balance = (parseInt(player.balance) - upgradeCost).toString();
  property.level += 1;

  // --- ДОБАВЛЕНИЕ В СПИСОК УЛУЧШЕННЫХ ЗА ХОД ---
  upgradedThisTurn.value.push(property.id);
  
  addLog(`${player.name} улучшил ${property.name} до уровня ${property.level} за ${upgradeCost}k`);
};

const isMonopolyCollected = (property) => {
  if (!property.relations) return false;
  
  // Находим все поля с таким же ID группы (relations)
  const group = steps.value.filter(s => s.relations === property.relations);
  
  // Проверяем, что у каждого поля в группе владелец — текущий игрок
  return group.every(s => s.owner === currentPlayer.value.id);
};

const checkWinner = () => {
  // Фильтруем игроков, чей баланс >= 0
  const survivors = activePlayers.value.filter(p => parseInt(p.balance) >= 0);

  if (survivors.length === 1) {
    const winner = survivors[0];
    addLog(`🏆 ИГРА ОКОНЧЕНА! ПОБЕДИТЕЛЬ: ${winner.name}`);
    
    // Используем setTimeout, чтобы alert не блокировал отрисовку последнего лога
    setTimeout(() => {
      alert(`🎉 Поздравляем! ${winner.name} победил в этой партии!`);
      // Здесь можно добавить логику перезагрузки игры или возврата в меню
      // location.reload(); 
    }, 500);
    
    return true;
  }
  return false;
};

const payFine = () => {
  const actor = currentPlayer.value;
  const fine = 500;
  
  // --- ЛОГИКА АВТО-ПРОДАЖИ ПРИ НЕХВАТКЕ СРЕДСТВ НА ШТРАФ ---
  while (parseInt(actor.balance) < fine) {
    // Ищем всё имущество игрока
    const myProperties = steps.value.filter(s => s.owner === actor.id);
    
    // Если имущества больше нет, а денег всё еще не хватает — выходим из цикла
    if (myProperties.length === 0) break;

    // Сортируем: сначала продаем объекты с низким уровнем (без домов), чтобы спасти прокачанные
    const propertyToSell = myProperties.sort((a, b) => a.level - b.level)[0];

    // Получаем цену продажи для текущего уровня объекта
    const sellPrice = propertyToSell.sellPrice[propertyToSell.level - 1];
    
    // Прибавляем деньги к балансу
    actor.balance = (parseInt(actor.balance) + parseInt(sellPrice)).toString();
    
    addLog(`Полиция: ${actor.name} продал ${propertyToSell.name} за ${sellPrice}k, чтобы оплатить штраф`);
    
    // Сбрасываем объект
    propertyToSell.owner = null;
    propertyToSell.level = 1;
  }

  // --- ПРОВЕРКА РЕЗУЛЬТАТА ---
  const finalBalance = parseInt(actor.balance);

  if (finalBalance >= fine) {
    // Денег хватило (сразу или после продаж)
    actor.balance = (finalBalance - fine).toString();
    actor.isInJail = false;
    actor.jailTurns = 0;
    addLog(`${actor.name} оплатил штраф 500k и вышел на свободу!`);
    // После оплаты в тюрьме ход не переходит (nextTurn не нужен), игрок может кинуть кубики
  } else {
    // Даже после продажи всего имущества денег не набралось
    addLog(`${actor.name} не смог оплатить штраф в тюрьме и обанкротился!`);
    
    // Вызываем вашу общую логику банкротства
    handleBankrupt(actor);
  }
};

const skipJailTurn = () => {
  const actor = currentPlayer.value;
  actor.jailTurns -= 1;
  addLog(`${actor.name} пропускает ход в участке. Осталось сидеть: ${actor.jailTurns}`);
  
  if (actor.jailTurns <= 0) {
    actor.isInJail = false;
    addLog(`${actor.name} отбыл срок и выйдет в следующем ходу.`);
  }
  nextTurn();
};
</script>

<template>
  <div class="game-screen">
    <div class="main-layout">
      <aside class="players-sidebar">
        <div v-for="player in activePlayers" :key="player.id" 
          class="player-card" 
          :class="{ 
      'active': player.active, 
      'is-bankrupt': parseInt(player.balance) < 0,
      /* Добавляем проверку, чтобы не подсвечивать свою карту как доступную для сделки */
      'trade-blocked': player.id === currentPlayer.id || player.id !== currentPlayer.id && (
        player.incomingTrade || 
        player.outgoingTrade || 
        currentPlayer.outgoingTrade ||
        !steps.some(s => s.owner === currentPlayer.id)
      )
    }"
         :style="[
      player.active ? { backgroundColor: player.color + '22', borderColor: player.color } : {},
      /* Убираем курсор-указатель для самого себя */
      player.id === currentPlayer.id ? { cursor: 'default' } : { cursor: 'pointer' }
    ]"
          @click="openTrade(player)">
          <div class="avatar-circle" :style="{ borderColor: player.color }">
            <span v-if="parseInt(player.balance) < 0" class="avatar-icon">💀</span>
            <span v-else class="avatar-icon">{{ player.avatar }}</span>
          </div>
          <div class="player-details">
            <div class="p-name">{{ player.name }}</div>
            <div class="p-balance">${{ player.balance }}k</div>
            <div v-if="player.incomingTrade" class="status-badge">Думает над договором...</div>
            <div v-if="player.outgoingTrade" class="status-badge">Ждет ответ на договор...</div>
          </div>
        </div>
      </aside>

      <main class="board-container">
        <div class="monopoly-grid" :class="{ 'trade-mode-active': isTradeOpen }">
          
          <div v-for="(cell, i) in topRow" :key="'top-'+cell.id" 
            class="cell top-cell" 
            :class="{ 'has-price': cell.price, 'owned': cell.owner }" 
            :style="{ gridColumn: i + 1, gridRow: 1, backgroundColor: getCellBg(cell), cursor: cell.price ? 'pointer' : 'default' }"
            @click="handleCellClick(cell)">
            <div v-if="cell.price" class="price-tag p-top" :style="{ background: cell.color }">{{ cell.owner ? cell.rent[cell.level - 1] : cell.price }}k</div>
            <div class="cell-content">
              <img v-if="cell.logo" :src="cell.logo" :class="['cell-logo', { 'logo-small': cell.type === 'car' || cell.type === 'park' }]">
              <span v-else class="cell-name">{{ cell.name }}</span>
            </div>
            <div class="tokens-layer">
            <TransitionGroup name="fade">
    <div v-for="p in activePlayers.filter(p => p.position === cell.id && parseInt(p.balance) >= 0)" 
         :key="p.id" 
         class="player-token" 
         :style="{ background: p.color }">
    </div>
  </TransitionGroup>
            </div>
          </div>

          <div v-for="(cell, i) in rightCol" :key="'right-'+cell.id" 
            class="cell side-cell right-cell" 
            :class="{ 'owned': cell.owner }" 
            :style="{ gridColumn: 11, gridRow: i + 2, backgroundColor: getCellBg(cell), cursor: cell.price ? 'pointer' : 'default' }"
            @click="handleCellClick(cell)">
            <div v-if="cell.price" class="price-tag p-right" :style="{ background: cell.color }">{{ cell.owner ? cell.rent[cell.level - 1] : cell.price }}k</div>
            <div class="cell-content">
              <img v-if="cell.logo" :src="cell.logo" :class="['cell-logo', { 'logo-small': cell.type === 'car' || cell.type === 'park' }]">
              <span v-else class="cell-name">{{ cell.name }}</span>
            </div>
            <div class="tokens-layer">
              <TransitionGroup name="fade">
                <div v-for="p in activePlayers.filter(p => p.position === cell.id && parseInt(p.balance) >= 0)" :key="p.id" class="player-token" :style="{ background: p.color }"></div>
              </TransitionGroup>
            </div>
          </div>

          <div v-for="(cell, i) in bottomRow" :key="'bottom-'+cell.id" 
            class="cell bottom-cell" 
            :class="{ 'has-price': cell.price, 'owned': cell.owner }" 
            :style="{ gridColumn: 11 - i, gridRow: 11, backgroundColor: getCellBg(cell), cursor: cell.price ? 'pointer' : 'default' }"
            @click="handleCellClick(cell)">
            <div v-if="cell.price" class="price-tag p-bottom" :style="{ background: cell.color }">{{ cell.owner ? cell.rent[cell.level - 1] : cell.price }}k</div>
            <div class="cell-content">
              <img v-if="cell.logo" :src="cell.logo" :class="['cell-logo', { 'logo-small': cell.type === 'car' || cell.type === 'park' }]">
              <span v-else class="cell-name">{{ cell.name }}</span>
            </div>
            <div class="tokens-layer">
              <TransitionGroup name="fade">
                <div v-for="p in activePlayers.filter(p => p.position === cell.id && parseInt(p.balance) >= 0)" :key="p.id" class="player-token" :style="{ background: p.color }"></div>
              </TransitionGroup>
            </div>
          </div>

          <div v-for="(cell, i) in leftCol" :key="'left-'+cell.id" 
            class="cell side-cell left-cell" 
            :class="{ 'owned': cell.owner }" 
            :style="{ gridColumn: 1, gridRow: 11 - (i + 1), backgroundColor: getCellBg(cell), cursor: cell.price ? 'pointer' : 'default' }"
            @click="handleCellClick(cell)">
            <div v-if="cell.price" class="price-tag p-left" :style="{ background: cell.color }">{{ cell.owner ? cell.rent[cell.level - 1] : cell.price }}k</div>
            <div class="cell-content">
              <img v-if="cell.logo" :src="cell.logo" :class="['cell-logo', { 'logo-small': cell.type === 'car' || cell.type === 'park' }]">
              <span v-else class="cell-name">{{ cell.name }}</span>
            </div>
            <div class="tokens-layer">
              <TransitionGroup name="fade">
                <div v-for="p in activePlayers.filter(p => p.position === cell.id && parseInt(p.balance) >= 0)" :key="p.id" class="player-token" :style="{ background: p.color }"></div>
              </TransitionGroup>
            </div>
          </div>

          <div class="center-area">
            <Transition name="fade">
              <div v-if="currentPlayer.incomingTrade" class="incoming-trade-notify">
                <div class="notify-content">
                  <h4>Договор от {{ currentPlayer.incomingTrade.senderName }}</h4>
                  <div class="trade-preview-lists">
                    <div class="preview-side">
                      <span class="preview-label">Вы получите:</span>
                      <div class="preview-items">
                        <div v-for="id in currentPlayer.incomingTrade.myOfferIds" :key="id" class="preview-item">
                          <span class="item-dot" :style="{ background: getTradeItemById(id)?.color }"></span>
                          {{ getTradeItemById(id)?.name }}
                        </div>
                        <div v-if="currentPlayer.incomingTrade.myMoney > 0" class="preview-item money-item">
                          <img class="money-input-wrap-icon-money-little" src="/img/some/money.svg" alt="money"> {{ currentPlayer.incomingTrade.myMoney }}k
                        </div>
                      </div>
                    </div>
                    <div class="preview-divider"><img class="trade-arrow-img" src="/img/some/arrow-swap.svg" alt=""></div>
                    <div class="preview-side">
                      <span class="preview-label">Вы отдадите:</span>
                      <div class="preview-items">
                        <div v-for="id in currentPlayer.incomingTrade.theirOfferIds" :key="id" class="preview-item">
                          <span class="item-dot" :style="{ background: getTradeItemById(id)?.color }"></span>
                          {{ getTradeItemById(id)?.name }}
                        </div>
                        <div v-if="currentPlayer.incomingTrade.theirMoney > 0" class="preview-item money-item">
                          <img class="money-input-wrap-icon-money-little" src="/img/some/money.svg" alt="money"> {{ currentPlayer.incomingTrade.theirMoney }}k
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="notify-actions">
                    <button class="accept-btn" @click="acceptTrade(currentPlayer)">Принять</button>
                    <button class="reject-btn" @click="rejectTrade(currentPlayer)">Отклонить</button>
                  </div>
                </div>
              </div>
            </Transition>
            
            <div v-if="isTradeOpen" class="trade-overlay">
              <div class="trade-modal-box">
                <div class="trade-header">
                  <h3 style="margin:0">Договор купли продажи</h3>
                  <button class="close-trade-x" @click="closeTrade">✕</button>
                </div>
                <div class="trade-body">
                  <div class="trade-side">
                    <div class="side-user" :style="{color: currentPlayer.color}">{{ currentPlayer.name }} (Вы) — {{ tradeData.myOffer.length }}/2</div>
                    <div class="trade-items-list">
                      <div v-for="item in tradeData.myOffer" :key="item.id" class="mini-card-trade">
                        <img :src="item.logo" class="mini-card-trade-image" alt="logo">
                        <div class="mini-card-trade-wrap-info">
                          <!-- <span class="color-indicator" :style="{background: item.color}"></span>  -->
                          <span>{{ item.name }}</span>
                          <span class="mini-card-trade-wrap-info-price">{{ getPropertyFullValue(item) }}k</span>
                        </div>
                      </div>
                      <div v-if="!tradeData.myOffer.length" class="empty-hint">Необходимо выбрать хотя бы одно поле</div>
                      <div class="money-input-wrap">
                        <label for="mymoney"><img class="money-input-wrap-icon-money" src="/img/some/money.svg" alt="money"></label>
                        <input type="number" id="mymoney" v-model="tradeData.myMoney" @input="validateMoney('myMoney')" placeholder="Сумма...">
                        <label for="mymoney"><span>k</span></label>
                      </div>
                      <img class="money-input-wrap-icon-keyboard" @click="toggleKeyboard('myMoney')" src="/img/some/keyboard.svg" alt="">
                    </div>
                  </div>
                  <div class="trade-arrow"><img class="trade-arrow-img" src="/img/some/arrow-swap.svg" alt=""></div>
                  <div class="trade-side">
                    <div class="side-user" :style="{color: tradeData.target.color}">{{ tradeData.target.name }} — {{ tradeData.theirOffer.length }}/2</div>
                    <div class="trade-items-list">
                      <div v-for="item in tradeData.theirOffer" :key="item.id" class="mini-card-trade">
                        <img :src="item.logo" class="mini-card-trade-image" alt="logo">
                        <div class="mini-card-trade-wrap-info">
                          <!-- <span class="color-indicator" :style="{background: item.color}"></span> {{ item.name }} -->
                          <span>{{ item.name }}</span>
                          <span class="mini-card-trade-wrap-info-price">{{ getPropertyFullValue(item) }}k</span>
                        </div>
                      </div>
                      <div v-if="!tradeData.theirOffer.length" class="empty-hint">Необходимо выбрать хотя бы одно поле</div>
                      <div class="money-input-wrap">
                        <label for="theirmoney"><img class="money-input-wrap-icon-money" src="/img/some/money.svg" alt="money"></label>
                        <input type="number" v-model="tradeData.theirMoney" id="theirmoney" @input="validateMoney('theirMoney')" placeholder="Сумма...">
                        <label for="theirmoney"><span>k</span></label>
                      </div>
                      <img class="money-input-wrap-icon-keyboard" @click="toggleKeyboard('theirMoney')" src="/img/some/keyboard.svg" alt="">
                    </div>
                  </div>
                </div>
                <div class="trade-footer">
                  <Transition name="fade">
                    <div v-if="activeKeyboardTarget" class="numpad-container">
                      <div class="numpad-grid">
                        <button v-for="n in [1,2,3,4,5,6,7,8,9,0]" :key="n" class="btn-digit" @click="typeNumber(n)">{{n}}</button>
                        <button class="btn-functional" @click="backspace">⌫</button>
                        <button class="btn-functional" @click="tradeData[activeKeyboardTarget] = 0">AC</button>
                      </div>
                      <button class="numpad-done-btn" @click="activeKeyboardTarget = null">ОК</button>
                    </div>
                  </Transition>
                  <button class="action-button" @click="sendTradeOffer" :disabled="!tradeData.myOffer.length && !tradeData.theirOffer.length">
                    Отправить предложение
                  </button>
                </div>
              </div>
            </div>

            <div v-else>
              <div v-if="activeDisplayCard" class="buy-card-overlay">
                <div class="property-buy-card">
                  <div class="property-header" :style="{ background: activeDisplayCard.color }">
                    <h3 class="property-title">{{ activeDisplayCard.name }}</h3>
                    <div class="property-description">{{ activeDisplayCard.description }}</div>
                    <img :src="activeDisplayCard.logo" class="buy-logo">
                  </div>
                  <div class="property-body">
                    <div class="buy-price"><div class='buy-price-left'>Стоимость поля</div> <div>{{ activeDisplayCard.price }}k</div></div>
                    <div v-for="(rent, idx) in activeDisplayCard.rent" :key="idx" class="buy-price">
                      <div class='buy-price-left'>Рента {{ idx + 1 }} ур.</div> <div>{{ rent }}k</div>
                    </div>

                    <div v-if="activeDisplayCard.country" class="buy-price country">
                      <div class='buy-price-left'>Расположение</div> 
                      <div class='buy-price-right'>
                        <img class="buy-price-left-country" :src="activeDisplayCard.countryImg" v-if="activeDisplayCard.countryImg">
                        {{ activeDisplayCard.country }}
                      </div>
                    </div>
                  </div>

                  <div class="buy-actions-wrapper">
                    <div v-if="propertyToBuy" class="buy-actions">
                      <button class="buy-btn" @click="buyProperty">Купить</button>
                      <button class="skip-btn" @click="skipBuy">Пропустить</button>
                    </div>

                    <div v-else-if="inspectedProperty" class="inspect-actions">
                      <div v-if="inspectedProperty.owner === currentPlayer.id && currentPlayer.active" class="inspect-actions-footer">
                        <button 
                          v-if="inspectedProperty.level < 5 && isMonopolyCollected(inspectedProperty)"
                          @click="upgradeProperty(inspectedProperty)"
                          class="upgrade-btn"
                          :disabled="upgradedThisTurn.includes(inspectedProperty.id)"
                        >
                          <span v-if="upgradedThisTurn.includes(inspectedProperty.id)">Уже улучшено</span>
                          <span v-else>Улучшить ({{ inspectedProperty.level === 1 ? 600 : 1500 }}k)</span>
                        </button>
                        <div v-else-if="inspectedProperty.level < 5" class="monopoly-hint">Соберите монополию для улучшения</div>
                        <div v-if="inspectedProperty.level >= 5" class="max-level-badge">Максимальный уровень</div>
                        <button @click="sellToBank(inspectedProperty)" class="sell-btn-alt">Продать за {{ inspectedProperty.sellPrice[inspectedProperty.level - 1] }}k</button>
                      </div>
                      <button class="action-button close-btn" @click="closeInspect">Закрыть</button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="turn-card">
                 <h2 v-if="currentPlayer.isInJail" class="turn-title">Вы задержаны! Осталось ходов: {{ currentPlayer.jailTurns }}</h2>
                 <h2 v-else class="turn-title">{{ currentPlayer.name }} ходит!</h2>
                 <div v-if="currentPlayer.isInJail" class='turn-description'>
                 {{ currentPlayer.name }} изучает трещины на потолке полицейского участка
                 </div>
                 <div v-else class='turn-description'>
                 {{ currentPhrase  }}
                 </div>
                <div class="dice-container">
                  <div v-for="(style, index) in diceStyles" :key="index" class="dice-scene">
                    <div class="cube" :style="style">
                      <div class="face front">1</div><div class="face right">2</div>
                      <div class="face back">3</div><div class="face left">4</div>
                      <div class="face bottom">5</div><div class="face top">6</div>
                    </div>
                  </div>
                </div>
                <div v-if="currentPlayer.isInJail" class="jail-controls">
                  <img src="/img/police1.svg" class="jail-police-image" alt="">
    <div class="buy-actions">
      <button class="buy-btn" @click="payFine">
      Заплатить 500k и выйти!
      </button>
    <button class="skip-btn" @click="skipJailTurn">Пропустить ход</button>
    </div>
          </div>
                <button v-else class="action-button" @click="rollDice" :disabled="isRolling">
                  {{ isRolling ? 'Ход игрока...' : 'Бросить кубики' }}
                </button>
              </div>
            </div>
            
            <div class="game-logs" ref="logContainer">
              <div v-for="log in logs" :key="log.id" class="log-line">{{ log.text }}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
    <button class="fullscreen-btn" @click="toggleFullscreen">⛶</button>
  </div>
</template>

<style scoped>
/* Все ваши стили сохранены без изменений */
.game-screen { background: #1a1d21; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
.main-layout { display: flex; gap: 20px; align-items: center; }
.monopoly-grid { 
  display: grid; grid-template-columns: 85px repeat(9, 1fr) 85px; grid-template-rows: 85px repeat(9, 1fr) 85px; 
  width: 90vh; height: 90vh; background: #333; gap: 2px; border: 4px solid #333; position: relative;
}

.cell { background: #fff; position: relative; display: flex; flex-direction: column; overflow: hidden; transition: background-color 0.4s; }
.cell-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px; }
.cell-logo { max-width: 85%; max-height: 65%; object-fit: contain; }
.cell-logo.logo-small { max-width: 75%; max-height: 55%; }
.cell-name { font-size: 10px; font-weight: bold; text-align: center; color: #333; }

.top-cell.has-price .cell-content { transform: translateY(-6px); }
.bottom-cell.has-price .cell-content { transform: translateY(-6px); }
.right-cell .cell-content { transform: rotate(0deg) translateX(8px); } 
.left-cell .cell-content { transform: rotate(0deg) translateX(-8px); } 

.price-tag { position: absolute; color: #fff; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; z-index: 5; }
.p-top { bottom: 0; left: 0; width: 100%; height: 20px; }
.p-bottom { bottom: 0; left: 0; width: 100%; height: 20px; }
.p-left { top: 0; right: 0; height: 100%; width: 20px; writing-mode: vertical-rl; }
.p-right { top: 0; left: 0; height: 100%; width: 20px; writing-mode: vertical-rl; transform: rotate(180deg); }

.fade-enter-active, .fade-leave-active { transition: all 0.25s ease-out; }
.fade-enter-from { opacity: 0; transform: scale(1.5); }
.fade-leave-to { opacity: 0; transform: scale(0.5); }

.tokens-layer { position: absolute; inset: 0; display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 2px; z-index: 20; }
.player-token { width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); }

.center-area { grid-column: 2 / 11; grid-row: 2 / 11; background: #2c2f33; display: flex; flex-direction: column; padding: 20px; justify-content: space-between; position: relative; }
.turn-card { background: white; padding: 20px; border-radius: 10px; text-align: center; }
.turn-title { text-align: left; margin-bottom: 4px; font-size: 18px; font-weight: 500; transition: color 0.3s; }
.turn-description{ text-align: left; font-size: 14px; font-weight: 300; color: #aaa}
.turn-description-alert{
  padding: 2px 6px; background-color: #FFB84D; border-radius: 4px; font-weight: 300; color: #333; margin-right: 2px;
}
.dice-container { display: flex; justify-content: center; gap: 20px; margin: 24px 0; }
.dice-scene { width: 60px; height: 60px; perspective: 300px; }
.cube { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 1s; }
.face { position: absolute; width: 60px; height: 60px; background: #eee; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; }
.front { transform: rotateY(0deg) translateZ(30px); }
.back { transform: rotateY(180deg) translateZ(30px); }
.right { transform: rotateY(90deg) translateZ(30px); }
.left { transform: rotateY(-90deg) translateZ(30px); }
.top { transform: rotateX(90deg) translateZ(30px); }
.bottom { transform: rotateX(-90deg) translateZ(30px); }

.action-button { background: #20a698; color: white; padding: 10px 30px; border: none; border-radius: 5px; cursor: pointer; width: 100%; font-size: 16px; transition: all 0.3s; }
.action-button:disabled { background: #555; cursor: not-allowed; opacity: 0.7; }
.close-btn { background: #6c757d; margin-top: 6px; }

.game-logs { background: rgba(0,0,0,0.5); color: #ccc; padding: 10px; height: 120px; overflow-y: auto; font-size: 14px; border-radius: 5px; text-align: left; scrollbar-width: thin;          /* Для Firefox */
  scrollbar-color: #26a69a #1a1a1a; /* Для Firefox (бегунок и фон) */ }
.game-logs::-webkit-scrollbar {
  width: 8px;               /* Ширина скроллбара */
}

.game-logs::-webkit-scrollbar-track {
  background: #1a1a1a;      /* Цвет дорожки (фон) */
  border-radius: 10px;
}

.game-logs::-webkit-scrollbar-thumb {
  background: #26a69a;      /* Цвет самого бегунка */
  border-radius: 10px;      /* Скругление */
  border: 2px solid #1a1a1a; /* Отступ от краев дорожки */
}

.game-logs::-webkit-scrollbar-thumb:hover {
  background: #2bbbad;      /* Цвет бегунка при наведении */
}

  .player-card { width: 200px; background: #23272a; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; align-items: center; gap: 15px; border-left: 5px solid transparent; transition: all 0.3s; cursor: pointer;  }
.player-card.active { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); transform: translateX(10px); }
.avatar-circle { width: 45px; height: 45px; border-radius: 50%; border: 3px solid; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.p-name { color: white; font-weight: bold; }
.p-balance { color: #99aab5; }
.fullscreen-btn { position: fixed; bottom: 20px; right: 20px; background: #23272a; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; }

.buy-card-overlay { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); animation: popIn 0.3s; z-index: 100; }
@keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.property-buy-card { display: flex; flex-direction: column; }
.property-header { position: relative; width: 100%; padding: 10px; color: white; border-radius: 5px; margin-bottom: 15px; font-weight: bold; }
.property-description{ font-weight: 300; font-size: 12px; padding-right: 40px; max-width: 400px; }
.property-title{ font-size: 16px; margin: 0; }
.buy-logo { max-width: 50px; height: auto; object-fit: contain; position: absolute; right: 10px; top: 10px; }
.buy-price { font-size: 14px; margin-bottom: 6px; color: #333333; display: flex; justify-content: space-between; font-weight: 500; }
.buy-price.country .buy-price-right{ display: flex; align-items: center; gap: 6px; }
.buy-price-left{ color: #757575; }
.buy-price-left-country{ width: 20px; height: auto; }
.buy-actions { display: flex; gap: 10px; width: 100%; margin-top: 8px; }
.buy-btn { flex: 2; background: #20a698; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-weight: bold; }
.skip-btn { flex: 1; background: #E0E0E0; color: #757575; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-weight: bold }

.cell.owned::after {
  content: 'КУПЛЕНО';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 8px;
  font-weight: bold;
  color: rgba(0,0,0,0.2);
  pointer-events: none;
}

/* СТИЛИ ДЛЯ СДЕЛКИ (НОВЫЕ) */
.trade-overlay { position: absolute; inset: 0; background: #1a1d21; z-index: 150; display: flex; align-items: center; justify-content: center; border-radius: 10px; }
.trade-modal-box { background: white; width: 95%; border-radius: 12px; padding: 15px; color: #333; }
.trade-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.close-trade-x { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; }
.trade-body { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 15px; }
.trade-side { flex: 1; background: #f0f2f5; padding: 10px; border-radius: 8px; min-height: 180px; }
.side-user { font-weight: bold; font-size: 16px; margin-bottom: 8px; text-align: center; }
.trade-items-list { display: flex; flex-direction: column; gap: 5px; }
.mini-card-trade { background: white; height: 44px; padding: 4px 10px; border-radius: 4px; font-size: 10px; display: flex; align-items: center; gap: 6px; font-weight: bold; border: 1px solid #e0e2e8; }
.color-indicator { width: 8px; height: 8px; border-radius: 50%; }
.trade-arrow { font-size: 20px; color: #20a698; }
.empty-hint { font-size: 11px; color: #aaa; text-align: center; margin-top: 40px; }
.trade-mode-active .cell:hover { outline: 3px solid #68d391; z-index: 60; }
.player-card.can-trade:hover { cursor: pointer; filter: brightness(1.3); transform: scale(1.02); }

.incoming-trade-notify {
  background: #fff;
  border-left: 5px solid #68d391;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  color: #333;
}
.notify-actions { display: flex; gap: 10px; margin-top: 10px; }
.accept-btn { background: #20a698; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; flex: 1; font-weight: bold; }
.reject-btn {  background: #E0E0E0; color: #757575; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; flex: 1; font-weight: bold; }

.trade-blocked {
  /* opacity: 0.8; */
  cursor: not-allowed !important;
  /* filter: grayscale(0.5); */
}

.status-badge {
  font-size: 9px;
  background: #ecc94b;
  color: #000;
  padding: 2px 5px;
  border-radius: 4px;
  margin-top: 5px;
  text-align: center;
  font-weight: bold;
  width: 80px;
}

.incoming-trade-notify {
  /* Убедитесь, что z-index высокий, чтобы уведомление было поверх всего */
  z-index: 200;
  border: 2px solid #68d391;
}

.mini-card-trade-image{
  width: 28px;
}
.mini-card-trade-wrap-info{
  font-size: 16px;
  /* display: flex;
  flex-direction: column; */
}
.incoming-trade-notify {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 1000;
  min-width: 320px;
  color: #333;
}

.trade-preview-lists {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-side {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.preview-label {
  font-size: 11px;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 5px;
}

.preview-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-item {
  font-size: 13px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.preview-divider {
  font-size: 20px;
  color: #ccc;
}

.empty-text {
  font-size: 12px;
  color: #bbb;
  font-style: italic;
}

.trade-arrow-img{
  width: 20px;
  margin-top: 10px;
}

.notify-content h4 {
  margin: 0;
  text-align: center;
}


.money-item {
  color: #27ae60;
  font-weight: bold;
  padding: 4px 0;
}
.preview-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Контейнер для инпута */
.money-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 10px;
  background: white; /* Легкий фон */
  border: 1px solid #e0e2e8;
  border-radius: 4px;
  height: 40px;
  transition: all 0.3s ease;
  padding: 4px 10px;
}

.money-input-wrap:focus-within {
  border-color: #68d391; /* Цвет активного игрока или основной зеленый */
  /* box-shadow: 0 0 8px rgba(104, 211, 145, 0.3); */
}

/* Сам инпут */
.money-input-wrap input {
  background: transparent;
  border: none;
  color: #68d391;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
  padding: 8px 0;
  outline: none;
  text-align: right; /* Число прижимается к "k" */
  padding-right: 2px;
}

/* Иконка валюты (k) */
.money-input-wrap span {
  color: #68d391; /* Цвет денег */
  font-weight: 800;
  font-size: 16px;
  text-transform: lowercase;
  user-select: none;
  display: flex;
  align-items: center;
}


/* Убираем стрелочки у input number */
.money-input-wrap input::-webkit-outer-spin-button,
.money-input-wrap input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.money-input-wrap input[type=number] {
  -moz-appearance: textfield;
}

/* Плейсхолдер */
.money-input-wrap input::placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
  font-weight: 400;
  text-align: left;
}

.money-input-wrap-icon-money{
  width: 24px;
  position: relative;
  top: 3px;
}
.money-input-wrap-icon-keyboard{
  width: 28px;
  cursor: pointer;
  margin-left: 4px;
  margin-top: 2px;
}

/* Контейнер клавиатуры */
.numpad-container {
 background: rgba(28, 28, 30, 0.95); /* Темный фон iOS */
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 8px;
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  max-height: 120px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* Сетка кнопок: делаем 6 колонок, чтобы кнопки шли в 2 ряда */
.numpad-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr); 
  gap: 4px;
  flex-grow: 1;
}

/* Стили кнопок */
.btn-digit, .btn-functional {
 height: 48px;
  border-radius: 8px;
  border: none;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background 0.1s, transform 0.1s;
  /* Убираем стандартное выделение при нажатии на мобилках */
  -webkit-tap-highlight-color: transparent;
}

/* Кнопки с цифрами */
.btn-digit {
  background: #636366; /* Серый цвет кнопок iOS */
}

/* Функциональные кнопки (AC, Backspace) */
.btn-functional {
  background: #48484a;
  font-size: 0.9rem;
}

/* Эффект нажатия (как на iPhone) */
.btn-digit:active, .btn-functional:active {
  background: #8e8e93;
  transform: scale(0.96);
}

/* Кнопка "Готово" / "OK" */
.numpad-done-btn {
  height: auto; /* Растянется по высоте контейнера */
  width: 70px;
  background: #ff9f0a; /* Оранжевый акцент iOS */
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}

.numpad-done-btn:active {
  background: #ffb340;
}
.money-input-wrap-icon-money-little{
  width: 16px;
}

.property-management-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  margin-bottom: 10px;
}

.upgrade-btn {
  background: #20a698; 
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
  font-size: 16px;
  margin-bottom: 6px;
}

.upgrade-btn:hover {
  opacity: 0.7;
}

.sell-btn-alt {
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  /* margin-bottom: 6px; */
  font-size: 16px;
}

.max-level-badge {
  background: #198754;
  color: white;
  text-align: center;
  padding: 5px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 300;
  margin-bottom: 6px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.upgrade-btn:disabled {
  background: #95a5a6 !important;
  cursor: not-allowed;
  opacity: 0.7;
}
.monopoly-hint {
  background: rgba(0, 0, 0, 0.05);
  color: #7f8c8d;
  font-size: 14px;
  text-align: center;
  padding: 8px;
  border-radius: 5px;
  border: 1px dashed #bdc3c7;
  margin-bottom: 6px;
}

.upgrade-btn:disabled {
  background: #bdc3c7 !important;
  color: white;
  cursor: not-allowed;
}

.inspect-actions{
  display: flex;
  flex-direction: column;
}

.inspect-actions-footer{
    display: flex;
  flex-direction: column;
}

.is-bankrupt {
  opacity: 0.1;
  filter: grayscale(1);
  pointer-events: none; /* Чтобы нельзя было кликнуть для трейда */
}
.bankrupt-label {
  color: red;
  font-weight: bold;
}

.mini-card-trade-wrap-info-price{
  font-weight: 300;
    color: #aaa;
    margin-left: 6px;
    /* font-size: 14px; */
}
.jail-police-image{
  max-width: 160px;
}
</style>