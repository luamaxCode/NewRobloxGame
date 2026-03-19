// Определение типов блоков
// 0 = пусто (нет блока)
const BLOCK_TYPES = {
  0: { name: 'Empty', color: 'transparent' },
  1: { name: 'Grass', color: '#4CAF50' },
  2: { name: 'Dirt',  color: '#8B5A2B' },
  3: { name: 'Stone', color: '#7D7D7D' }
};

function getBlockColor(id) {
  const b = BLOCK_TYPES[id];
  return b ? b.color : 'transparent';
}
