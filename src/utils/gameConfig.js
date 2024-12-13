// 难度等级配置
export const DIFFICULTY_LEVELS = {
  EASY: {
    name: "简单",
    gridSize: 2,
    minHints: 2,
    maxHints: 2,
  },
  NORMAL: {
    name: "普通",
    gridSize: 3,
    minHints: 3,
    maxHints: 3,
  },
  HARD: {
    name: "困难",
    gridSize: 4,
    minHints: 4,
    maxHints: 5,
  },
  EXPERT: {
    name: "专家",
    gridSize: 5,
    minHints: 5,
    maxHints: 6,
  },
};

// 生成指定范围内的随机整数
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 寻找所有可能的路径
function findPaths(gridSize) {
  const grid = Array.from({ length: gridSize }, (_, i) =>
    Array.from({ length: gridSize }, (_, j) => i * gridSize + j + 1)
  );
  const totalCells = gridSize * gridSize;
  const directions = [
    [0, 1], // 右
    [1, 0], // 下
    [0, -1], // 左
    [-1, 0], // 上
  ];

  const results = [];

  function isValid(x, y, visited) {
    return x >= 0 && x < gridSize && y >= 0 && y < gridSize && !visited[x][y];
  }

  function backtrack(x, y, path, visited) {
    if (path.length === totalCells) {
      results.push([...path]);
      return;
    }

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (isValid(nx, ny, visited)) {
        visited[nx][ny] = true;
        path.push(grid[nx][ny]);
        backtrack(nx, ny, path, visited);
        path.pop();
        visited[nx][ny] = false;
      }
    }
  }

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const visited = Array.from({ length: gridSize }, () =>
        Array(gridSize).fill(false)
      );
      visited[i][j] = true;
      backtrack(i, j, [grid[i][j]], visited);
    }
  }

  return results;
}

// 从路径中生成提示数字
function generateHintsFromPath(gridSize, path, numHints) {
  const hints = {};
  const randomIndices = new Set();

  // 确保至少包含第一个位置
  randomIndices.add(0);

  // 随机选择其余的提示位置
  while (randomIndices.size < numHints) {
    randomIndices.add(getRandomInt(1, path.length - 1));
  }

  // 将选中的位置转换为提示数字
  randomIndices.forEach((index) => {
    const num = path[index];
    const row = Math.floor((num - 1) / gridSize);
    const col = (num - 1) % gridSize;
    hints[`${row}-${col}`] = index + 1;
  });

  return hints;
}

// 根据难度生成游戏配置
export const generateGameConfig = (difficulty) => {
  const { gridSize, minHints, maxHints } = DIFFICULTY_LEVELS[difficulty];

  // 获取所有可能的路径
  const solutions = findPaths(gridSize);

  // 随机选择一条路径
  const selectedPath = solutions[Math.floor(Math.random() * solutions.length)];

  // 确定提示数字的数量
  const numHints = getRandomInt(minHints, maxHints);

  // 生成提示数字
  const hints = generateHintsFromPath(gridSize, selectedPath, numHints);

  return {
    gridSize,
    hints,
    numHints,
    solution: selectedPath,
  };
};
