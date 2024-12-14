import { useState, useEffect, useRef } from "react";
import { generateInitialArray, getSolution } from "@/utils";
import {
  isAdjacent,
  isHintCell,
  validateHintCell,
  calculatePathData,
} from "@/utils/game";
import {
  initAudioContext,
  playClickSound,
  playCompleteSound,
  playErrorSound,
} from "@/utils/sound";
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

  // 初始化音频上下文
  useEffect(() => {
    initAudioContext();
  }, []);

  // 初始化游戏
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

  // 检查格子是否已经在路径中
  const isInPath = (row, col) => {
    return path.findIndex((cell) => cell.row === row && cell.col === col);
  };

  // 获取格子在路径中的序号
  const getPathNumber = (row, col) => {
    const index = isInPath(row, col);
    return index === -1 ? null : index + 1;
  };

  // 验证提示格子的序号并更新错误状态
  const validateAndUpdateErrors = (row, col, pathNumber) => {
    if (!isHintCell(initialGrid, row, col)) return true;

    const isValid = validateHintCell(initialGrid, row, col, pathNumber);

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

    // 检查第一次点击是否正确
    if (isHintCell(initialGrid, row, col)) {
      const hintNumber = parseInt(initialGrid[row][col]);
      if (hintNumber === 1) {
        playClickSound(); // 只有点击数字1的格子才播放正常音效
      } else {
        playErrorSound(); // 点击其他提示数字的格子播放错误音效
        validateAndUpdateErrors(row, col, 1);
      }
    } else {
      playClickSound(); // 第一次点击非提示格子也播放错误音效
    }
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
          if (isHintCell(initialGrid, cell.row, cell.col)) {
            validateAndUpdateErrors(cell.row, cell.col, index + 1);
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
        const isValid = validateAndUpdateErrors(row, col, newPath.length);
        if (!isValid) {
          playErrorSound(); // 在这里播放错误音效
        } else {
          playClickSound(); // 只在有效移动时播放点击音效
        }
        return newPath;
      });
      setCurrentCell(newCell);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    checkCompletion(path);
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
    if (isHintCell(initialGrid, row, col)) {
      return initialGrid[row][col];
    }
    const pathNumber = getPathNumber(row, col);
    return pathNumber || "";
  };

  // 获取格子的类名
  const getCellClassName = (row, col) => {
    const classes = [styles.gridCell];
    if (isHintCell(initialGrid, row, col)) {
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

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (path.length > 0) {
        setPathData(
          calculatePathData(path, gridRef.current, GRID_SIZE, styles)
        );
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [path]);

  useEffect(() => {
    setPathData(calculatePathData(path, gridRef.current, GRID_SIZE, styles));
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
