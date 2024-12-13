import { useState, useEffect } from "react";
import { generateInitialArray, getSolution } from "../../utils";
import { GRID_SIZE } from "../../constant";
import "./Game.less";

const Game = () => {
  const [initialGrid, setInitialGrid] = useState([]); // 初始网格状态
  const [isDragging, setIsDragging] = useState(false); // 是否正在拖拽
  const [path, setPath] = useState([]); // 当前绘制的路径
  const [currentCell, setCurrentCell] = useState(null); // 当前选中的格子

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    const solution = getSolution();
    const grid = generateInitialArray(GRID_SIZE, solution);
    setInitialGrid(grid);
    setPath([]);
    setCurrentCell(null);
  };

  // 检查两个格子是否相邻
  const isAdjacent = (cell1, cell2) => {
    if (!cell1 || !cell2) return false;
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  // 检查格子是否已经在路径中
  const isInPath = (row, col) => {
    return path.some(cell => cell.row === row && cell.col === col);
  };

  // 处理鼠标按下事件
  const handleMouseDown = (row, col) => {
    setIsDragging(true);
    const newCell = { row, col };
    setCurrentCell(newCell);
    setPath([newCell]);
  };

  // 处理鼠标移动事件
  const handleMouseEnter = (row, col) => {
    if (!isDragging) return;

    const newCell = { row, col };
    if (isInPath(row, col)) return; // 如果格子已在路径中，忽略

    // 检查是否与当前格子相邻
    if (isAdjacent(currentCell, newCell)) {
      setPath(prevPath => [...prevPath, newCell]);
      setCurrentCell(newCell);
    }
  };

  // 处理鼠标松开事件
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="wrapper">
      <div 
        className="grid"
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={handleMouseUp}
      >
        {initialGrid.map((row, rowIndex) => (
          <div className="grid-row" key={rowIndex}>
            {row.map((cell, colIndex) => (
              <div
                className={`grid-cell ${cell !== "*" ? "filled" : ""} ${
                  isInPath(rowIndex, colIndex) ? "in-path" : ""
                }`}
                key={colIndex}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              >
                {cell !== "*" ? cell : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;
