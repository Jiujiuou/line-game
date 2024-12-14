// 检查两个格子是否相邻
export const isAdjacent = (cell1, cell2) => {
  if (!cell1 || !cell2) return false;
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.col - cell2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

// 检查是否是提示格子
export const isHintCell = (grid, row, col) => {
  return grid[row][col] !== "*";
};

// 验证提示格子的序号
export const validateHintCell = (grid, row, col, pathNumber) => {
  if (!isHintCell(grid, row, col)) return true;
  const hintNumber = parseInt(grid[row][col]);
  return pathNumber === hintNumber;
};

// 计算 SVG 路径数据
export const calculatePathData = (path, gridRef, gridSize, styles) => {
  if (!gridRef || path.length < 2) return "";

  const cells = gridRef.getElementsByClassName(styles.gridCell);
  if (!cells || cells.length === 0) return "";

  const cellArray = Array.from(cells);
  const gridRect = gridRef.getBoundingClientRect();

  const pathPoints = path
    .map((point) => {
      const index = point.row * gridSize + point.col;
      const cell = cellArray[index];
      if (!cell) return null;
      const cellRect = cell.getBoundingClientRect();

      return {
        x: cellRect.left - gridRect.left + cellRect.width / 2,
        y: cellRect.top - gridRect.top + cellRect.height / 2,
      };
    })
    .filter((point) => point !== null);

  if (pathPoints.length < 2) return "";

  let svgPath = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
  for (let i = 1; i < pathPoints.length; i++) {
    const current = pathPoints[i];
    svgPath += ` L ${current.x} ${current.y}`;
  }

  return svgPath;
};
