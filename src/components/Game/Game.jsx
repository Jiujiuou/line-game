import { useState, useEffect } from "react";
import { generateInitialArray, getSolution } from "../../utils";
import { GRID_SIZE } from "../../constant";
import "./Game.less";

const Game = () => {
  const [initialGrid, setInitialGrid] = useState([]);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    const solution = getSolution();
    const grid = generateInitialArray(GRID_SIZE, solution);
    setInitialGrid(grid);
  };

  return (
    <div className="wrapper">
      <div className="grid">
        {initialGrid.map((row, rowIndex) => (
          <div className="grid-row" key={rowIndex}>
            {row.map((cell, colIndex) => (
              <div
                className={`grid-cell ${cell !== "*" ? "filled" : ""}`}
                key={colIndex}
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
