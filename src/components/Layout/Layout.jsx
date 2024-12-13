import React, { useState, useCallback } from "react";
import Game from "../Game/Game";
import Timer from "../Timer/Timer";
import DifficultySelector from "../DifficultySelector/DifficultySelector";
import { DIFFICULTY_LEVELS, generateGameConfig } from "../../utils/gameConfig";
import "./Layout.less";

const Layout = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [finalTime, setFinalTime] = useState(null);
  const [currentDifficulty, setCurrentDifficulty] = useState("NORMAL");
  const [gameConfig, setGameConfig] = useState(() => generateGameConfig("NORMAL"));
  const [gameKey, setGameKey] = useState(0); // 用于强制重新渲染Game组件

  const handleGameComplete = () => {
    setIsTimerRunning(false);
  };

  const handleTimeUpdate = (time) => {
    if (!isTimerRunning) {
      setFinalTime(time);
    }
  };

  const handleDifficultyChange = useCallback((difficulty) => {
    setCurrentDifficulty(difficulty);
    setGameConfig(generateGameConfig(difficulty));
    setGameKey(prev => prev + 1); // 强制重新渲染Game组件
    setIsTimerRunning(true);
    setFinalTime(null);
  }, []);

  return (
    <div className="layout-container">
      <div className="main-content">
        <div className="nav-bar">
          <div className="logo">Jiujiu-Game</div>
        </div>
        <Timer isRunning={isTimerRunning} onTimeUpdate={handleTimeUpdate} />
        <div className="game-area">
          <Game 
            key={gameKey}
            gridSize={gameConfig.gridSize}
            hints={gameConfig.hints}
            onComplete={handleGameComplete}
          />
        </div>
      </div>
      <div className="control-panel">
        <DifficultySelector
          currentDifficulty={currentDifficulty}
          onDifficultyChange={handleDifficultyChange}
        />
      </div>
    </div>
  );
};

export default Layout;
