// Основная логика приложения
… // описание ниже

(function () {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Установка размера канваса под окно
  const toolbar = document.getElementById('toolbar');
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight - toolbar.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Мир и камера
  let camera = { x: WORLD_W / 2, y: WORLD_H / 2, zoom: 1.0 };
  const baseTile = 26; // базовый размер клетки в пикселях при zoom = 1
  let selectedBlock = 1; // текущий выбранный блок (Grass)

  // Игрок (для примера просмотра)
  let player = { x: WORLD_W / 2, y: WORLD_H / 2 };
  let followPlayer = true;

  // Управление клавиатурой
  const keys = {};
  window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    // Переключить режим следования за игроком
    if (e.key.toLowerCase() === 'f') {
      followPlayer = !followPlayer;
    }
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  // Ввод мыши
  let isPlacing = true;
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const tileSize = Math.max(6, baseTile * camera.zoom);

    // Преобразование экрана в мир
    const worldX = Math.floor((sx - canvas.width / 2) / tileSize + camera.x);
    const worldY = Math.floor((sy - canvas.height / 2) / tileSize + camera.y);

    if (e.button === 0) {
      // Левый клик: поставить блок
      if (inBounds(worldX, worldY)) {
        setBlock(worldX, worldY, selectedBlock);
      }
    } else if (e.button === 2) {
      // Правый клик: удалить блок
      if (inBounds(worldX, worldY)) {
        setBlock(worldX, worldY, 0);
      }
    }
  });
  // Запрет контекстного меню на канвасе
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // Выбор блока через кнопки в тулбаре
  const blockBtns = document.querySelectorAll('.block-btn');
  blockBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedBlock = parseInt(btn.getAttribute('data-id') || '1', 10);
      blockBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
    });
  });

  // Сохранение/Загрузка/Экспорт
  document.getElementById('saveBtn').addEventListener('click', () => saveWorld());
  document.getElementById('loadBtn').addEventListener('click', () => loadWorld());
  document.getElementById('exportBtn').addEventListener('click', () => exportWorld());

  function saveWorld() {
    const data = JSON.stringify(grid);
    localStorage.setItem('miniRoblox_grid', data);
    console.log('World saved');
  }

  function loadWorld() {
    const data = localStorage.getItem('miniRoblox_grid');
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      // Простая перезагрузка: переназначим grid-подобную структуру
      for (let x = 0; x < WORLD_W; x++) {
        for (let y = 0; y < WORLD_H; y++) {
          grid[x][y] = (parsed[x] && parsed[x][y]) ?? 0;
        }
      }
      console.log('World loaded');
    } catch (err) {
      console.error('Failed to load world', err);
    }
  }

  function exportWorld() {
    const data = JSON.stringify(grid);
    // В простом виде выводим в консоль; можно копировать
    console.log('Exported world:', data);
    navigator.clipboard?.writeText(data).catch(() => {});
  }

  // Рендеринг
  const render = () => {
    // Обновление камеры (следование за игроком, если включено)
    if (followPlayer) {
      camera.x = player.x;
      camera.y = player.y;
    }

    // Очистка
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Размер тайла
    const tileSize = Math.max(6, baseTile * camera.zoom);

    // Видимые границы мира
    const halfW = canvas.width / 2;
    const halfH = canvas.height / 2;
    const startX = Math.floor(camera.x - (halfW) / tileSize) - 1;
    const endX = Math.floor(camera.x + (halfW) / tileSize) + 1;
    const startY = Math.floor(camera.y - (halfH) / tileSize) - 1;
    const endY = Math.floor(camera.y + (halfH) / tileSize) + 1;

    // Рисование блоков
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        if (!inBounds(x, y)) continue;
        const id = grid[x][y];
        if (id > 0) {
          ctx.fillStyle = getBlockColor(id);
          const sx = (x - camera.x) * tileSize + halfW;
          const sy = (y - camera.y) * tileSize + halfH;
          ctx.fillRect(sx, sy, tileSize, tileSize);
          // Простая рамка
          ctx.strokeStyle = 'rgba(0,0,0,0.25)';
          ctx.strokeRect(sx, sy, tileSize, tileSize);
        }
      }
    }

    // Игрок как красная точка
    const psx = (player.x - camera.x) * tileSize + halfW;
    const psy = (player.y - camera.y) * tileSize + halfH;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(psx + tileSize / 2, psy + tileSize / 2, Math.max(4, tileSize * 0.25), 0, Math.PI * 2);
    ctx.fill();

    // Обновление позиции игрока (постоянное перемещение)
    const spd = 0.15 * (tileSize / baseTile); // адаптивная скорость зависит от масштаба
    if (keys['w'] || keys['ArrowUp']) player.y -= spd;
    if (keys['s'] || keys['ArrowDown']) player.y += spd;
    if (keys['a'] || keys['ArrowLeft']) player.x -= spd;
    if (keys['d'] || keys['ArrowRight']) player.x += spd;

    // Держим в пределах мира
    player.x = Math.max(0, Math.min(WORLD_W - 1, player.x));
    player.y = Math.max(0, Math.min(WORLD_H - 1, player.y));

    requestAnimationFrame(render);
  };

  // Инициализация
  window.addEventListener('load', () => {
    // Немного заполнить стартовый мир
    seedWorld();
    // Текущий выбранный блок в кнопке
    const firstBtn = document.querySelector('.block-btn[data-id="1"]');
    firstBtn?.setAttribute('aria-pressed', 'true');
    followPlayer = true;
    render();
  });
})();
