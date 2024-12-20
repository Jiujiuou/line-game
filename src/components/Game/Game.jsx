import { useState, useEffect, useRef } from "react";
import { generateInitialArray, getSolution } from "../../utils";
import { GRID_SIZE } from "../../constant";
import "./Game.less";
import Confetti from "../Confetti";

const Game = ({ gridSize = 3, hints = {}, onComplete }) => {
  const [initialGrid, setInitialGrid] = useState([]); // 初始网格状态
  const [isDrawing, setIsDrawing] = useState(false); // 是否正在绘制
  const [path, setPath] = useState([]); // 当前绘制的路径
  const [currentCell, setCurrentCell] = useState(null); // 当前选中的格子
  const [errors, setErrors] = useState(new Set()); // 记录错误的格子位置
  const [isComplete, setIsComplete] = useState(false); // 是否完成并且正确
  const [isAllConnected, setIsAllConnected] = useState(false); // 是否连接所有格子
  const [pathData, setPathData] = useState('');
  const gridRef = useRef(null);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    const grid = [];
    for (let i = 0; i < gridSize; i++) {
      const row = [];
      for (let j = 0; j < gridSize; j++) {
        const key = `${i}-${j}`;
        row.push({
          row: i,
          col: j,
          value: hints[key] || 0,
        });
      }
      grid.push(row);
    }
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
    return initialGrid[row][col].value !== 0;
  };

  // 验证提示格子的序号
  const validateHintCell = (row, col, pathNumber) => {
    if (!isHintCell(row, col)) return true;
    const hintNumber = initialGrid[row][col].value;
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

  // 验证路径是否正确
  const validatePath = () => {
    // 检查是否有重复的数字
    const pathNumbers = new Map();
    path.forEach((point, index) => {
      pathNumbers.set(index + 1, { row: point.row, col: point.col });
    });

    // 检查所有提示数字
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const value = initialGrid[i][j].value;
        if (value !== 0) {
          // 检查提示数字的位置是否与路径匹配
          const pathPoint = pathNumbers.get(value);
          if (!pathPoint || pathPoint.row !== i || pathPoint.col !== j) {
            return false;
          }
        }
      }
    }

    // 检查路径长度是否覆盖所有格子
    return path.length === gridSize * gridSize;
  };

  // 处理鼠标按下事件
  const handleMouseDown = (row, col) => {
    setIsDrawing(true);
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
    if (!isDrawing) return;

    // 检查是否是相邻格子
    const lastPoint = path[path.length - 1];
    const isAdjacent = Math.abs(row - lastPoint.row) + Math.abs(col - lastPoint.col) === 1;
    if (!isAdjacent) return;

    // 检查是否回到了之前的格子
    const existingIndex = path.findIndex(p => p.row === row && p.col === col);
    if (existingIndex !== -1) {
      // 如果回到了之前的格子，删除从那个点之后的所有路径
      const newPath = path.slice(0, existingIndex + 1);
      setPath(newPath);
      
      calculatePathData();
      return;
    }

    // 检查是否已经访问过
    const index = row * gridSize + col;
    if (isInPath(row, col) !== -1) return;

    // 更新路径和访问状态
    const newPath = [...path, { row, col }];
    setPath(newPath);
    
    calculatePathData();
  };

  // 检查是否完成并且正确
  const checkCompletion = (currentPath) => {
    if (currentPath.length === gridSize * gridSize) {
      const isValid = validatePath();
      setIsComplete(isValid);
      if (isValid && onComplete) {
        onComplete();
      }
    }
  };

  // 处理鼠标松开事件
  const handleMouseUp = () => {
    setIsDrawing(false);
    checkCompletion(path);
  };

  // 获取格子显示的数字
  const getCellContent = (row, col) => {
    if (isHintCell(row, col)) {
      return initialGrid[row][col].value;
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

  // 计算路径数据
  const calculatePathData = () => {
    if (!gridRef.current || path.length < 2) {
      setPathData('');
      return;
    }

    // 获取所有格子元素
    const cells = gridRef.current.querySelectorAll('.grid-cell');
    const cellArray = Array.from(cells);
    const gridRect = gridRef.current.getBoundingClientRect();

    // 生成路径数据
    const pathPoints = path.map(point => {
      const index = point.row * gridSize + point.col;
      const cell = cellArray[index];
      const cellRect = cell.getBoundingClientRect();
      
      // 计算相对于grid的中心点位置
      return {
        x: cellRect.left - gridRect.left + cellRect.width / 2,
        y: cellRect.top - gridRect.top + cellRect.height / 2
      };
    });

    // 生成 SVG 路径数据
    let svgPath = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    
    for (let i = 1; i < pathPoints.length; i++) {
      const current = pathPoints[i];
      const prev = pathPoints[i - 1];
      
      // 如果是直线路径
      if (path[i].row === path[i-1].row || path[i].col === path[i-1].col) {
        svgPath += ` L ${current.x} ${current.y}`;
      } else {
        // 使用圆弧连接
        const radius = Math.min(cellArray[0].offsetWidth, cellArray[0].offsetHeight) / 2;
        
        // 计算控制点（转角处的中心点）
        const controlX = path[i-1].col === path[i].col ? prev.x : current.x;
        const controlY = path[i-1].col === path[i].col ? current.y : prev.y;
        
        // 添加圆弧路径
        svgPath += ` L ${controlX} ${controlY}`;
        svgPath += ` A ${radius} ${radius} 0 0 1 ${current.x} ${current.y}`;
      }
    }

    setPathData(svgPath);
  };

  // 监听路径变化重新计算路径数据
  useEffect(() => {
    calculatePathData();
  }, [path]);

  // 监听窗口大小变化重新计算路径
  useEffect(() => {
    const handleResize = () => {
      calculatePathData();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [path]);

  // 在 useEffect 中检测游戏完成
  useEffect(() => {
    if (isComplete) {
      onComplete && onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className="wrapper">
      {isComplete && <Confetti isActive={true} />}
      <div 
        ref={gridRef}
        className={getGridContainerClassName()}
        onMouseLeave={() => setIsDrawing(false)}
        onMouseUp={handleMouseUp}
        style={{ position: 'relative' }}
      >
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <path
            d={pathData}
            stroke="#4A90E2"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
