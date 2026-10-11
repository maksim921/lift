const state = {
  floor: 12,
  moving: false,
  doorsOpen: true,
  trips: 127,
  notifications: 2,
  autoMode: false,
  loadKg: 320,
  people: 4,
  theme: 0
};

const chartSets = {
  today: [10,8,9,7,9,11,15,18,17,20,25,23,27,29,32,26,22,24,27,23,18,20,15,12],
  yesterday: [7,6,6,8,7,9,12,14,13,15,16,18,19,21,23,20,18,19,17,16,14,12,10,8],
  week: [12,15,17,14,18,20,22,25,24,23,21,26,28,25,29,27,26,24,22,21,19,17,16,14]
};

const floorRail = document.getElementById('floorRail');
const currentMarker = document.getElementById('currentMarker');
const markerFloor = document.getElementById('markerFloor');
const liftCabin = document.getElementById('liftCabin');
const counterWeight = document.getElementById('counterWeight');

for (let i = 1; i <= 25; i++) {
  const div = document.createElement('button');
  div.type = 'button';
  div.className = 'floor';
  div.dataset.floor = i;
  div.textContent = i;
  div.title = `Перейти на ${i} этаж`;
  div.addEventListener('click', () => moveLiftTo(i));
  floorRail.appendChild(div);
}


function floorToBottom(floor){
  return 4 + (floor - 1) / 24 * 90;
}
function counterToBottom(floor){
  return 77 - (floor - 1) / 24 * 62;
}


function toast(message){
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}


const floorModal = document.getElementById('floorModal');
const floorGrid = document.getElementById('floorGrid');
const chooseFloorBtn = document.getElementById('chooseFloorBtn');
const floorModalClose = document.getElementById('floorModalClose');
const floorModalBackdrop = document.getElementById('floorModalBackdrop');

for(let i = 1; i <= 25; i++){
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'floorChoice';
  button.dataset.floor = i;
  button.textContent = i;
  button.addEventListener('click', () => {
    closeFloorModal();
    moveLiftTo(i);
  });
  floorGrid.appendChild(button);
}

function syncFloorPicker(){
  document.querySelectorAll('.floorChoice').forEach(button => {
    const current = Number(button.dataset.floor) === state.floor;
    button.classList.toggle('current', current);
    button.setAttribute('aria-current', current ? 'true' : 'false');
    button.title = current ? `Лифт сейчас на ${state.floor} этаже` : `Поехать на ${button.dataset.floor} этаж`;
  });
}

function openFloorModal(){
  syncFloorPicker();
  floorModal.classList.add('open');
  floorModal.setAttribute('aria-hidden', 'false');
}

function closeFloorModal(){
  floorModal.classList.remove('open');
  floorModal.setAttribute('aria-hidden', 'true');
}

chooseFloorBtn.addEventListener('click', openFloorModal);
currentMarker.addEventListener('click', openFloorModal);
floorModalClose.addEventListener('click', closeFloorModal);
floorModalBackdrop.addEventListener('click', closeFloorModal);
document.addEventListener('keydown', (event) => {
  if(event.key === 'Escape' && floorModal.classList.contains('open')){
    closeFloorModal();
  }
});




function updateLiftVisual(){
  liftCabin.style.bottom = Math.max(2, floorToBottom(state.floor) - 7) + '%';
  counterWeight.style.bottom = counterToBottom(state.floor) + '%';
  currentMarker.style.bottom = Math.max(2, floorToBottom(state.floor) - 1) + '%';
  markerFloor.textContent = state.floor;
  currentMarker.title = `Текущий этаж: ${state.floor}. Нажмите, чтобы выбрать другой этаж`;
  liftCabin.dataset.door = state.doorsOpen ? 'open' : 'closed';
  liftCabin.classList.toggle('moving', state.moving);
}

function render(){
  document.getElementById('floorBig').textContent = state.floor;
  syncFloorPicker();

  document.querySelectorAll('#floorRail .floor').forEach(button => {
    const current = Number(button.dataset.floor) === state.floor;
    button.classList.toggle('active', current);
    button.setAttribute('aria-current', current ? 'true' : 'false');
  });

  updateLiftVisual();

  document.getElementById('moveState').textContent = state.moving
    ? 'Кабина движется к выбранному этажу'
    : 'Нажмите на синюю полоску или выберите этаж слева';
  document.getElementById('cabStatus').textContent = state.moving ? '● В движении' : '● На месте';
  document.getElementById('doorState').textContent = state.doorsOpen ? 'Открыты' : 'Закрыты';
  document.getElementById('doorHint').textContent = state.doorsOpen
    ? 'Без препятствий'
    : (state.moving ? 'Двери заблокированы во время движения' : 'Двери готовы к открытию');
  document.getElementById('doorBtn').textContent = state.doorsOpen ? 'Закрыть двери' : 'Открыть двери';
  document.getElementById('speedText').textContent = state.moving ? '1.6 м/с' : '0.0 м/с';
  document.getElementById('speedBar').style.width = state.moving ? '91%' : '0%';
  document.getElementById('tripCount').textContent = state.trips;
  document.getElementById('notifyCount').textContent = state.notifications;
  document.getElementById('loadText').textContent = state.loadKg;
  document.getElementById('peopleText').textContent = Math.max(1, Math.min(13, Math.round(state.loadKg / 80)));
  document.getElementById('loadBar').style.width = Math.min(100, state.loadKg / 10) + '%';
  document.getElementById('loadRangeText').textContent = state.loadKg;
  document.getElementById('tempText').textContent = (54 + Math.round(state.loadKg / 80)) + ' °C';
  document.getElementById('workBadge').style.color = state.moving ? 'var(--green)' : 'var(--blue2)';
  document.getElementById('workBadge').querySelector('span:last-child').textContent = state.moving ? 'В работе' : 'Ожидание';
  document.getElementById('statusSubtitle').textContent = state.moving ? 'Нормальная эксплуатация' : 'Лифт готов к вызову';
}

function finishMove(targetFloor){
  state.floor = targetFloor;
  state.moving = false;
  state.doorsOpen = true;
  state.trips += 1;
  state.notifications = Math.max(0, state.notifications + (Math.random() > 0.82 ? 1 : 0));
  render();
  toast('Лифт прибыл на ' + state.floor + ' этаж');
}

function moveLiftTo(targetFloor){
  if(state.moving) return;
  if(targetFloor < 1 || targetFloor > 25) return;
  if(targetFloor === state.floor){
    toast('Лифт уже находится на ' + targetFloor + ' этаже');
    return;
  }

  const floorsDiff = Math.abs(targetFloor - state.floor);
  state.moving = true;
  state.doorsOpen = false;
  render();

  // Visual motion starts immediately because CSS transitions react to floor change
  state.floor = targetFloor;
  updateLiftVisual();

  const duration = Math.min(2400, Math.max(700, floorsDiff * 180));
  setTimeout(() => finishMove(targetFloor), duration);
}

function moveLift(dir){
  moveLiftTo(state.floor + dir);
}

document.getElementById('upBtn').addEventListener('click', () => moveLift(1));
document.getElementById('downBtn').addEventListener('click', () => moveLift(-1));

document.getElementById('doorBtn').addEventListener('click', () => {
  if(state.moving){
    toast('Во время движения двери заблокированы');
    return;
  }
  state.doorsOpen = !state.doorsOpen;
  render();
  toast(state.doorsOpen ? 'Двери открыты' : 'Двери закрыты');
});

document.getElementById('autoBtn').addEventListener('click', () => {
  state.autoMode = !state.autoMode;
  document.getElementById('autoBtn').style.borderColor = state.autoMode ? '#3e7dd1' : '#2a3c4b';
  document.getElementById('autoBtn').style.color = state.autoMode ? '#fff' : '#cfe2f1';
  toast(state.autoMode ? 'Авто-режим включён' : 'Авто-режим выключен');
});

document.getElementById('liftSelect').addEventListener('change', (e) => {
  const map = {
    '1': { floor: 7, trips: 96, load: 180 },
    '2': { floor: 18, trips: 113, load: 410 },
    '3': { floor: 12, trips: 127, load: 320 }
  };
  const d = map[e.target.value];
  state.floor = d.floor;
  state.trips = d.trips;
  state.loadKg = d.load;
  state.moving = false;
  state.doorsOpen = true;
  render();
  toast('Переключено на ' + e.target.options[e.target.selectedIndex].text);
});

document.getElementById('loadRange').addEventListener('input', (e) => {
  state.loadKg = Number(e.target.value);
  render();
});

document.querySelectorAll('.status').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('statusDetail').textContent = btn.dataset.detail;
    toast(btn.dataset.detail);
  });
});

document.querySelectorAll('.shaftStatus').forEach(btn => {
  btn.addEventListener('click', () => toast(btn.dataset.info));
});

function updateClock(){
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('ru-RU');
}
setInterval(updateClock, 1000);
updateClock();

function drawChart(key = 'today'){
  const data = chartSets[key];
  const x0 = 40, y0 = 180, width = 550, height = 135;
  const step = width / (data.length - 1);
  let points = [];
  let maxV = 40;

  data.forEach((v, i) => {
    const x = x0 + i * step;
    const y = y0 - (v / maxV) * height;
    points.push([x, y, v, i]);
  });

  const linePts = points.map(p => `${p[0]},${p[1]}`).join(' ');
  const areaPts = `${x0},${y0} ` + linePts + ` ${x0 + width},${y0}`;
  document.getElementById('tripLine').setAttribute('points', linePts);
  document.getElementById('areaLine').setAttribute('points', areaPts);

  const dots = document.getElementById('chartDots');
  dots.innerHTML = '';
  points.forEach(p => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', p[0]);
    c.setAttribute('cy', p[1]);
    c.setAttribute('r', 4);
    c.setAttribute('fill', '#0b141d');
    c.setAttribute('stroke', '#4eb0ff');
    c.setAttribute('stroke-width', 2);
    c.style.cursor = 'pointer';
    c.addEventListener('mouseenter', (ev) => {
      const tip = document.getElementById('chartTip');
      tip.style.opacity = '1';
      tip.style.left = ev.clientX + 'px';
      tip.style.top = ev.clientY + 'px';
      tip.innerHTML = `<b>${p[2]} поездок</b><br>${String(p[3]).padStart(2, '0')}:00–${String((p[3] + 1) % 24).padStart(2, '0')}:00`;
    });
    c.addEventListener('mousemove', (ev) => {
      const tip = document.getElementById('chartTip');
      tip.style.left = ev.clientX + 'px';
      tip.style.top = ev.clientY + 'px';
    });
    c.addEventListener('mouseleave', () => document.getElementById('chartTip').style.opacity = '0');
    dots.appendChild(c);
  });
}
drawChart();

document.getElementById('periodSelect').addEventListener('change', e => {
  drawChart(e.target.value);
  toast('Обновлён период: ' + e.target.options[e.target.selectedIndex].text);
});

document.getElementById('refreshBtn').addEventListener('click', () => {
  state.notifications = Math.max(0, state.notifications + (Math.random() > 0.5 ? 1 : -1));
  state.trips += Math.round(Math.random() * 3);
  render();
  drawChart(document.getElementById('periodSelect').value);
  toast('Данные обновлены');
});

document.getElementById('themeBtn').addEventListener('click', () => {
  state.theme = (state.theme + 1) % 3;
  const root = document.documentElement;
  if (state.theme === 0) {
    root.style.setProperty('--blue', '#2e9bff');
    root.style.setProperty('--blue2', '#6fb8ff');
    root.style.setProperty('--green', '#2dd18a');
  } else if (state.theme === 1) {
    root.style.setProperty('--blue', '#61a6ff');
    root.style.setProperty('--blue2', '#8cd4ff');
    root.style.setProperty('--green', '#41ddb0');
  } else {
    root.style.setProperty('--blue', '#7d63ff');
    root.style.setProperty('--blue2', '#b29cff');
    root.style.setProperty('--green', '#35d9a5');
  }
  drawChart(document.getElementById('periodSelect').value);
  toast('Акцент панели изменён');
});

setInterval(() => {
  if (!state.autoMode || state.moving) return;
  const dir = Math.random() > .5 ? 1 : -1;
  if (state.floor + dir >= 1 && state.floor + dir <= 25) {
    moveLift(dir);
  }
}, 5200);

render();
