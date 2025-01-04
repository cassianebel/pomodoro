import { useState, useEffect } from "react";
import PartyMode from "react-confetti";
import { CSSTransition } from "react-transition-group";

function App() {
  const [focusLeft, setFocusLeft] = useState(1 * 60); // 25 minutes
  const [isFocus, setIsFocus] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
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
    setIsFocus(false);
    setFocusLeft(25 * 60);
    setBreakLeft(5 * 60);
  };

  const triggerConfetti = () => {
    setShowConfetti(true); // Show the confetti
    setTimeout(() => setShowConfetti(false), 5000); // Reset after 5 seconds
  };

  const handleEndBreak = () => {
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
              triggerConfetti();
              clearInterval(timer);
              setIsFocus(false);
              setPomodoros((prevPomodoros) => prevPomodoros + 1);
              let poms = pomodoros + 1;
              if (poms % 4 === 0) {
                setBreakLeft(2 * 60); // 15 minutes
              } else {
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
              handleEndBreak();
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

  return (
    <div className="mx-auto max-w-2xl p-4">
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
        <div className="overlay" />
      </CSSTransition>
      <h1>Pomodoro</h1>
      <div
        className={`border p-4 ${isFocus ? "bg-purple-100" : "bg-yellow-100"}`}
      >
        <button className="px-4 py-2 border m-2" onClick={() => toggleTimer()}>
          {isRunning
            ? "Pause"
            : isBreak
            ? "Resume"
            : isFocus
            ? "Resume"
            : "Start"}
        </button>

        <p>Pomodoros Completed: {pomodoros}</p>
        <p>Focus Time: {formatTime(focusLeft)}</p>
        <p>Break Time: {formatTime(breakLeft)}</p>

        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
}

export default App;
