import React from "react";
import Game from "../Game/Game";
import "./Layout.less";

const Layout = () => {
  return (
    <div className="layout-container">
      <div className="main-content">
        <div className="nav-bar">
          <div className="logo">Jiujiu-Game</div>
        </div>
        <div className="game-area">
          <Game />
        </div>
      </div>
      <div className="control-panel"></div>
    </div>
  );
};

export default Layout;
