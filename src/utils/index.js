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

  // 返回所有解法
  return results;
}

export const generateInitialArray = (GRID_SIZE, solution) => {
  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill("*")
  );

  const randomIndices = new Set();

  while (randomIndices.size < 3) {
    randomIndices.add(Math.floor(Math.random() * solution.length));
  }

  solution.forEach((num, index) => {
    if (randomIndices.has(index)) {
      const x = Math.floor((num - 1) / GRID_SIZE);
      const y = (num - 1) % GRID_SIZE;
      grid[x][y] = index + 1;
    }
  });
  return grid;
};

export const getSolution = () => {
  // 获取所有解法
  const solutions = findPaths(3);
  const randomSolution =
    solutions[Math.floor(Math.random() * solutions.length)];
  return randomSolution;
};
