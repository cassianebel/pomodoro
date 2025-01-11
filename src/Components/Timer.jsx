import CircularProgress from "./CircularProgress";
import Countdown from "./Countdown";

const Timer = ({
  name,
  darkMode,
  isType,
  started,
  typeLeft,
  totalType,
  strokeColors,
  fillColors,
  baseColors,
}) => {
  const calcPercentage = (timeLeft, totalTime) => {
    return ((timeLeft / totalTime) * 100).toFixed(2);
  };

  return (
    <div className="relative flex justify-center items-center">
      <div className="rotate-[-90deg]">
        <CircularProgress
          darkMode={darkMode}
          percentage={calcPercentage(typeLeft, totalType)}
          strokeColor={darkMode ? strokeColors[0] : strokeColors[1]}
        />
      </div>

      <div className="absolute w-40 h-40 rounded-full text-center flex flex-col justify-center items-center mx-auto">
        <h2>{name}</h2>
        {(isType || !started) && (
          <Countdown
            percentage={calcPercentage(typeLeft, totalType)}
            timeLeft={typeLeft}
            fillColor={darkMode ? fillColors[0] : fillColors[1]}
            baseColor={darkMode ? baseColors[0] : baseColors[1]}
          />
        )}
      </div>
    </div>
  );
};

export default Timer;
