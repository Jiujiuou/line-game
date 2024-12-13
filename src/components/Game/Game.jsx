import { useState, useEffect } from "react";
import { generateInitialArray, getSolution } from "../../utils";
import { GRID_SIZE } from "../../constant";
import "./Game.less";
import Confetti from "../Confetti";

const Game = () => {
  const [initialGrid, setInitialGrid] = useState([]); // 初始网格状态
  const [isDragging, setIsDragging] = useState(false); // 是否正在拖拽
  const [path, setPath] = useState([]); // 当前绘制的路径
  const [currentCell, setCurrentCell] = useState(null); // 当前选中的格子
  const [errors, setErrors] = useState(new Set()); // 记录错误的格子位置
  const [isComplete, setIsComplete] = useState(false); // 是否完成并且正确
  const [isAllConnected, setIsAllConnected] = useState(false); // 是否连接所有格子

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    const solution = getSolution();
    const grid = generateInitialArray(GRID_SIZE, solution);
    setInitialGrid(grid);
    setPath([]);
    setCurrentCell(null);
    setErrors(new Set());
    setIsComplete(false);
    setIsAllConnected(false);
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
    return path.findIndex(cell => cell.row === row && cell.col === col);
  };

  // 获取格子在路径中的序号
  const getPathNumber = (row, col) => {
    const index = isInPath(row, col);
    return index === -1 ? null : index + 1;
  };

  // 检查是否是提示格子
  const isHintCell = (row, col) => {
    return initialGrid[row][col] !== "*";
  };

  // 验证提示格子的序号
  const validateHintCell = (row, col, pathNumber) => {
    if (!isHintCell(row, col)) return true;
    const hintNumber = parseInt(initialGrid[row][col]);
    const isValid = pathNumber === hintNumber;
    
    // 更新错误状态
    setErrors(prev => {
      const newErrors = new Set(prev);
      if (!isValid) {
        newErrors.add(`${row}-${col}`);
      } else {
        newErrors.delete(`${row}-${col}`);
      }
      return newErrors;
    });

    return isValid;
  };

  // 处理鼠标按下事件
  const handleMouseDown = (row, col) => {
    setIsDragging(true);
    const newCell = { row, col };
    setCurrentCell(newCell);
    setPath([newCell]);
    setErrors(new Set());
    setIsComplete(false);
    setIsAllConnected(false);
    validateHintCell(row, col, 1);
  };

  // 处理鼠标移动事件
  const handleMouseEnter = (row, col) => {
    if (!isDragging) return;

    const newCell = { row, col };
    if (isInPath(row, col) !== -1) return; // 如果格子已在路径中，忽略

    // 检查是否与当前格子相邻
    if (isAdjacent(currentCell, newCell)) {
      setPath(prevPath => {
        const newPath = [...prevPath, newCell];
        validateHintCell(row, col, newPath.length);
        return newPath;
      });
      setCurrentCell(newCell);
    }
  };

  // 检查是否完成并且正确
  const checkCompletion = (currentPath) => {
    // 检查是否所有格子都被连接
    const isAllCellsConnected = currentPath.length === GRID_SIZE * GRID_SIZE;
    // 检查是否没有错误
    const hasNoErrors = errors.size === 0;
    
    setIsAllConnected(isAllCellsConnected);
    setIsComplete(isAllCellsConnected && hasNoErrors);
  };

  // 处理鼠标松开事件
  const handleMouseUp = () => {
    setIsDragging(false);
    checkCompletion(path);
  };

  // 获取格子显示的数字
  const getCellContent = (row, col) => {
    if (isHintCell(row, col)) {
      return initialGrid[row][col];
    }
    const pathNumber = getPathNumber(row, col);
    return pathNumber || "";
  };

  // 获取格子的类名
  const getCellClassName = (row, col) => {
    const classes = ["grid-cell"];
    if (isHintCell(row, col)) {
      classes.push("filled");
      if (errors.has(`${row}-${col}`)) {
        classes.push("error");
      }
    } else if (isComplete && isInPath(row, col) !== -1) {
      classes.push("complete"); // 添加完成状态的类名
    } else if (isInPath(row, col) !== -1) {
      classes.push("in-path");
    }
    return classes.join(" ");
  };

  // 获取网格容器的类名
  const getGridContainerClassName = () => {
    const classes = ["grid"];
    if (isAllConnected) {
      classes.push("connected");
      classes.push(isComplete ? "success" : "error");
    }
    return classes.join(" ");
  };

  return (
    <div className="wrapper">
      {isComplete && <Confetti isActive={true} />}
      <div 
        className={getGridContainerClassName()}
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={handleMouseUp}
      >
        {initialGrid.map((row, rowIndex) => (
          <div className="grid-row" key={rowIndex}>
            {row.map((cell, colIndex) => (
              <div
                className={getCellClassName(rowIndex, colIndex)}
                key={colIndex}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              >
                {getCellContent(rowIndex, colIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;
