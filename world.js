// Глобальные параметры мира
const WORLD_W = 40;
const WORLD_H = 40;

// 2D сетка блоков: grid[x][y] = id блока
let grid = Array.from({ length: WORLD_W }, () =>
  Array.from({ length: WORLD_H }, () => 0)
);

// Установка блока
function setBlock(x, y, id) {
  if (!inBounds(x, y)) return;
  grid[x][y] = id;
}

// Получение блока
function getBlock(x, y) {
  if (!inBounds(x, y)) return 0;
  return grid[x][y];
}

// Проверка границ
function inBounds(x, y) {
  return x >= 0 && y >= 0 && x < WORLD_W && y < WORLD_H;
}

// Очистка мира (для быстрого теста)
function clearWorld() {
  for (let x = 0; x < WORLD_W; x++) {
    for (let y = 0; y < WORLD_H; y++) {
      grid[x][y] = 0;
    }
  }
}

// Режим предзагрузки (несколько блоков для примера)
function seedWorld() {
  for (let x = 8; x < 12; x++) {
    for (let y = 8; y < 12; y++) {
      grid[x][y] = 3; // Stone
    }
  }
  for (let x = 5; x < 15; x++) {
    grid[x][6] = 2; // Dirt
  }
  for (let y = 6; y < 9; y++) {
    grid[7][y] = 1; // Grass
  }
}
