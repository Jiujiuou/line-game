import { useState, useEffect, useRef } from "react";
import { generateInitialArray, getSolution } from "@/utils";
import { GRID_SIZE } from "@/constant";
import Confetti from "@/components/Confetti";
import styles from "./index.module.less";

const Game = () => {
  // 游戏状态管理
  const [initialGrid, setInitialGrid] = useState([]); // 初始网格状态
  const [isDragging, setIsDragging] = useState(false); // 是否正在拖拽
  const [path, setPath] = useState([]); // 当前绘制的路径
  const [currentCell, setCurrentCell] = useState(null); // 当前选中的格子
  const [errors, setErrors] = useState(new Set()); // 记录错误的格子位置
  const [isComplete, setIsComplete] = useState(false); // 是否完成并且正确
  const [isAllConnected, setIsAllConnected] = useState(false); // 是否连接所有格子
  const [pathData, setPathData] = useState(""); // SVG 路径数据

  const gridRef = useRef(null);

  // 使用 Web Audio API 创建音效
  const audioContext = useRef(null);

  useEffect(() => {
    // 初始化 Web Audio API
    audioContext.current = new (window.AudioContext ||
      window.webkitAudioContext)();
  }, []);

  // 播放点击音效
  const playClickSound = () => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, audioContext.current.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.current.currentTime + 0.1
    );

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + 0.1);
  };

  // 播放完成音效
  const playCompleteSound = () => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(400, audioContext.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      800,
      audioContext.current.currentTime + 0.2
    );

    gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.current.currentTime + 0.3
    );

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + 0.3);
  };

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
    return path.findIndex((cell) => cell.row === row && cell.col === col);
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
    setErrors((prev) => {
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

  const handleMouseDown = (row, col) => {
    setIsDragging(true);
    const newCell = { row, col };

    setCurrentCell(newCell);

    setPath([newCell]);
    setErrors(new Set());
    setIsComplete(false);
    setIsAllConnected(false);
    validateHintCell(row, col, 1);
    playClickSound();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    checkCompletion(path);
  };

  const handleMouseEnter = (row, col) => {
    if (!isDragging) return;

    const newCell = { row, col };
    const existingIndex = path.findIndex((p) => p.row === row && p.col === col);

    if (existingIndex !== -1) {
      // 如果回到了之前的格子，删除从那个点之后的所有路径
      const newPath = path.slice(0, existingIndex + 1);
      setPath(newPath);

      // 清除所有错误状态，然后重新验证当前路径上的所有提示格子
      setErrors(() => {
        const newErrors = new Set();
        newPath.forEach((cell, index) => {
          if (isHintCell(cell.row, cell.col)) {
            const hintNumber = parseInt(initialGrid[cell.row][cell.col]);
            if (index + 1 !== hintNumber) {
              newErrors.add(`${cell.row}-${cell.col}`);
            }
          }
        });
        return newErrors;
      });

      setCurrentCell(newCell);
      return;
    }

    // 检查是否与当前格子相邻
    if (isAdjacent(currentCell, newCell)) {
      setPath((prevPath) => {
        const newPath = [...prevPath, newCell];
        validateHintCell(row, col, newPath.length);
        return newPath;
      });
      setCurrentCell(newCell);
      playClickSound();
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
    if (isAllCellsConnected && hasNoErrors) {
      playCompleteSound();
    }
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
    const classes = [styles.gridCell];
    if (isHintCell(row, col)) {
      classes.push(styles.filled);
      if (errors.has(`${row}-${col}`)) {
        classes.push(styles.error);
      }
    } else if (isComplete && isInPath(row, col) !== -1) {
      classes.push(styles.complete); // 添加完成状态的类名
    } else if (isInPath(row, col) !== -1) {
      classes.push(styles.inPath);
    }
    return classes.join(" ");
  };

  // 获取网格容器的类名
  const getGridContainerClassName = () => {
    const classes = [styles.grid];
    if (isAllConnected) {
      classes.push(styles.connected);
      classes.push(isComplete ? styles.success : styles.error);
    }
    return classes.join(" ");
  };

  // 计算路径数据
  const calculatePathData = () => {
    if (!gridRef.current || path.length < 2) {
      setPathData("");
      return;
    }
    // 获取所有格子元素
    const cells = gridRef.current.getElementsByClassName(styles.gridCell);
    if (!cells || cells.length === 0) {
      setPathData("");
      return;
    }

    const cellArray = Array.from(cells);
    const gridRect = gridRef.current.getBoundingClientRect();

    // 生成路径数据
    const pathPoints = path
      .map((point) => {
        const index = point.row * GRID_SIZE + point.col;
        const cell = cellArray[index];
        if (!cell) {
          return null;
        }
        const cellRect = cell.getBoundingClientRect();

        // 计算相对于grid的中心点位置
        return {
          x: cellRect.left - gridRect.left + cellRect.width / 2,
          y: cellRect.top - gridRect.top + cellRect.height / 2,
        };
      })
      .filter((point) => point !== null);

    if (pathPoints.length < 2) {
      setPathData("");
      return;
    }

    // 生成 SVG 路径数据
    let svgPath = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

    for (let i = 1; i < pathPoints.length; i++) {
      const current = pathPoints[i];
      svgPath += ` L ${current.x} ${current.y}`;
    }

    setPathData(svgPath);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (path.length > 0) {
        calculatePathData();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [path]);

  useEffect(() => {
    calculatePathData();
  }, [path]);

  return (
    <div className={styles.wrapper}>
      {isComplete && <Confetti isActive={true} />}
      <div
        ref={gridRef}
        className={getGridContainerClassName()}
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={handleMouseUp}
        style={{ position: "relative" }}
      >
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
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
          <div className={styles.gridRow} key={rowIndex}>
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
