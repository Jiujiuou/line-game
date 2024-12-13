import React, { useState, useEffect } from "react";
import "./Timer.less";

const Timer = ({ isRunning = true, onTimeUpdate }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let intervalId;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 10); // 每10毫秒更新一次
      }, 10);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(time);
    }
  }, [time, onTimeUpdate]);

  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  return (
    <div className="timer">
      <div className="digit">{minutes.toString().padStart(2, "0")[0]}</div>
      <div className="digit">{minutes.toString().padStart(2, "0")[1]}</div>
      <div className="separator">:</div>
      <div className="digit">{seconds.toString().padStart(2, "0")[0]}</div>
      <div className="digit">{seconds.toString().padStart(2, "0")[1]}</div>
      <div className="separator">:</div>
      <div className="digit">{milliseconds.toString().padStart(2, "0")[0]}</div>
      <div className="digit">{milliseconds.toString().padStart(2, "0")[1]}</div>
    </div>
  );
};

export default Timer;
