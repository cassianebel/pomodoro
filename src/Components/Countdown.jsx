import { useState, useEffect } from "react";

const Countdown = ({ percentage, timeLeft, fillColor, baseColor }) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className="text-8xl font-display leading-none"
      style={{
        backgroundImage: `linear-gradient(to top, ${fillColor} ${percentage}%, ${baseColor} ${percentage}%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        transition: "background-image 0.1s linear",
        textShadow: "2px 2px 3px rgba(255,255,255,0.17)",
      }}
    >
      {formatTime(timeLeft)}
    </div>
  );
};

export default Countdown;
