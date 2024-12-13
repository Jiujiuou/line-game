import React from "react";
import { DIFFICULTY_LEVELS } from "../../utils/gameConfig";
import "./DifficultySelector.less";

const DifficultySelector = ({ currentDifficulty, onDifficultyChange }) => {
  return (
    <div className="difficulty-selector">
      <h2 className="section-title">难度选择</h2>
      <div className="difficulty-buttons">
        {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
          <button
            key={key}
            className={`difficulty-button ${currentDifficulty === key ? 'active' : ''}`}
            onClick={() => onDifficultyChange(key)}
          >
            <span className="difficulty-name">{level.name}</span>
            <span className="grid-size">{level.gridSize}×{level.gridSize}</span>
            <span className="hints-range">提示数字: {level.minHints}-{level.maxHints}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;
