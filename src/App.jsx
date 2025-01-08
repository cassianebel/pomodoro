import { useState, useEffect } from "react";
import PartyMode from "react-confetti";
import { CSSTransition } from "react-transition-group";
import CircularProgress from "./Components/CircularProgress";
import Countdown from "./Components/Countdown";
import Button from "./Components/Button";

function App() {
  const [totalFocus, setTotalFocus] = useState(1 * 60); // 25 minutes
  const [focusLeft, setFocusLeft] = useState(1 * 60); // 25 minutes
  const [isFocus, setIsFocus] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
  const [totalBreak, setTotalBreak] = useState(1 * 60); // 5 minutes
  const [breakLeft, setBreakLeft] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animate, setAnimate] = useState(false);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!isFocus && !isBreak) {
      setIsFocus(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsFocus(false);
    setIsBreak(false);
    setFocusLeft(1 * 60); // 25 minutes
    setBreakLeft(1 * 60); // 5 minutes
  };

  const endFocusAnimation = () => {
    setShowConfetti(true); // Show the confetti
    setTimeout(() => setShowConfetti(false), 5000); // Reset after 5 seconds
  };

  const endBreakAnimation = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 100); // Reset `in` to false after animation
  };

  useEffect(() => {
    let timer;
    if (!isRunning) {
      clearInterval(timer);
    } else {
      if (isFocus) {
        setIsBreak(false);
        setBreakLeft(0);
        timer = setInterval(() => {
          setFocusLeft((prevTime) => {
            if (prevTime <= 1) {
              endFocusAnimation();
              clearInterval(timer);
              setIsFocus(false);
              setPomodoros((prevPomodoros) => prevPomodoros + 1);
              let poms = pomodoros + 1;
              if (poms % 4 === 0) {
                setTotalBreak(2 * 60); // 15 minutes
                setBreakLeft(2 * 60); // 15 minutes
              } else {
                setTotalBreak(1 * 60); // 5 minutes
                setBreakLeft(1 * 60); // 5 minutes
              }
              setIsBreak(true);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else if (isBreak && isRunning) {
        timer = setInterval(() => {
          setBreakLeft((prevTime) => {
            if (prevTime <= 1) {
              endBreakAnimation();
              clearInterval(timer);
              setIsBreak(false);
              setFocusLeft(1 * 60); // 25 minutes
              setIsFocus(true);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, isFocus, isBreak]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const calcPercentage = (timeLeft, totalTime) => {
    return ((timeLeft / totalTime) * 100).toFixed(2);
  };

  return (
    <div
      className={`flex flex-col items-center justify-evenly h-screen mx-auto p-4 font-body ${
        isFocus
          ? "bg-gradient-to-b from-violet-200 to-violet-400 text-violet-950"
          : isBreak
          ? "bg-gradient-to-b from-teal-300 to-teal-100 text-teal-900"
          : "bg-gradient-to-b from-slate-200 to-slate-400 text-slate-900"
      }`}
    >
      {showConfetti && (
        <PartyMode
          recycle={false}
          colors={[
            "purple",
            "mediumpurple",
            "mediumorchid",
            "magenta",
            "darkmagenta",
            "darkviolet",
            "fuchsia",
          ]}
        />
      )}
      <CSSTransition
        in={animate}
        timeout={2000}
        classNames="fade"
        unmountOnExit
      >
        <div className="overlay"></div>
      </CSSTransition>

      <Button handleClick={toggleTimer}>
        {isRunning
          ? "Pause"
          : isBreak
          ? "Resume"
          : isFocus
          ? "Resume"
          : "Start"}
      </Button>

      <p>Pomodoros Completed: {pomodoros}</p>
      <div className="relative flex justify-center items-center">
        <div className="rotate-[-90deg]">
          <CircularProgress
            percentage={calcPercentage(focusLeft, totalFocus)}
            strokeColor="#5b21b6"
          />
        </div>

        <div className="absolute w-40 h-40 rounded-full text-center flex flex-col justify-center items-center mx-auto">
          <p>Focus</p>
          {isFocus && (
            <Countdown
              percentage={calcPercentage(focusLeft, totalFocus)}
              timeLeft={focusLeft}
              fillColor="#2e1065"
              baseColor="#6d28d9"
            />
          )}
        </div>
      </div>
      <div className="relative flex justify-center items-center">
        <div className="rotate-[-90deg]">
          <CircularProgress
            percentage={calcPercentage(breakLeft, totalBreak)}
            strokeColor="#115e59"
          />
        </div>
        <div className="absolute w-40 h-40 rounded-full text-center flex flex-col justify-center items-center mx-auto">
          <p>Break</p>
          {isBreak && (
            <Countdown
              percentage={calcPercentage(breakLeft, totalBreak)}
              timeLeft={breakLeft}
              fillColor="#042f2e"
              baseColor="#0f766e"
            />
          )}
        </div>
      </div>
      <Button handleClick={resetTimer}>Reset</Button>
    </div>
  );
}

export default App;
