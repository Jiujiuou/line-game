import React, { useState } from "react";
import Game from "../Game/Game";
import Timer from "../Timer/Timer";
import "./Layout.less";

const Layout = () => {
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [finalTime, setFinalTime] = useState(null);

  const handleGameComplete = () => {
    setIsTimerRunning(false);
  };

  const handleTimeUpdate = (time) => {
    if (!isTimerRunning) {
      setFinalTime(time);
    }
  };

  return (
    <div className="layout-container">
      <div className="main-content">
        <div className="nav-bar">
          <div className="logo">Jiujiu-Game</div>
        </div>
        <Timer isRunning={isTimerRunning} onTimeUpdate={handleTimeUpdate} />
        <div className="game-area">
          <Game onComplete={handleGameComplete} />
        </div>
      </div>
      <div className="control-panel"></div>
    </div>
  );
};

export default Layout;
