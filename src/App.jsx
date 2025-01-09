import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import PartyMode from "react-confetti";
import { CSSTransition } from "react-transition-group";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import CircularProgress from "./Components/CircularProgress";
import Countdown from "./Components/Countdown";
import Button from "./Components/Button";
import Modifier from "./Components/Modifier";

function App() {
  const [started, setStarted] = useState(false);
  const [totalFocus, setTotalFocus] = useState(25 * 60); // 25 minutes
  const [focusLeft, setFocusLeft] = useState(25 * 60); // 25 minutes
  const [isFocus, setIsFocus] = useState(false);
  const [pomodoros, setPomodoros] = useState(0);
  const [totalBreak, setTotalBreak] = useState(5 * 60); // 5 minutes
  const [totalShortBreak, setTotalShortBreak] = useState(5 * 60); // 5 minutes
  const [totalLongBreak, setTotalLongBreak] = useState(15 * 60); // 15 minutes
  const [breakLeft, setBreakLeft] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fade, setFade] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const timerRef = useRef(0.5);
  const popRef = useRef(null);
  const chimeRef = useRef(null);

  useEffect(() => {
    popRef.current = new Howl({
      src: ["./442265__crafty_juggler__pop-sound.mp3"],
      volume: volume,
    });

    chimeRef.current = new Howl({
      src: ["./616696__melokacool__chimes-saved.mp3"],
      volume: volume,
    });
  }, []);

  useEffect(() => {
    if (popRef.current) {
      popRef.current.volume(volume);
    }
    if (chimeRef.current) {
      chimeRef.current.volume(volume);
    }
  }, [volume]);

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };

  const toggleTimer = () => {
    setStarted(true);
    setIsRunning(!isRunning);
    if (!isFocus && !isBreak) {
      setIsFocus(true);
    }
  };

  const endFocusAnimation = () => {
    if (popRef.current) {
      popRef.current.play(); // play the pop sound
      setTimeout(() => popRef.current.stop(), 3000); // Stop the playback after 3 seconds
    }
    setShowConfetti(true); // Show the confetti
    setTimeout(() => setShowConfetti(false), 5000); // Reset after 5 seconds
  };

  const endBreakAnimation = () => {
    if (chimeRef.current) {
      chimeRef.current.play(); // play the chime sound
      setTimeout(() => chimeRef.current.stop(), 3000); // Stop the playback after 3 seconds
    }
    setFade(true);
    setTimeout(() => setFade(false), 100); // Reset `in` to false after animation
  };

  useEffect(() => {
    if (isRunning) {
      if (isFocus) {
        timerRef.current = setInterval(() => {
          setFocusLeft((prevTime) => {
            if (prevTime <= 1) {
              endFocusAnimation();
              clearInterval(timerRef.current);
              setIsFocus(false);
              setPomodoros((prevPomodoros) => prevPomodoros + 1);
              let poms = pomodoros + 1;
              if (poms % 4 === 0) {
                setTotalBreak(totalLongBreak);
                setBreakLeft(totalLongBreak);
                setIsLongBreak(true);
              } else {
                setTotalBreak(totalShortBreak);
                setBreakLeft(totalShortBreak);
                setIsLongBreak(false);
              }
              setIsBreak(true);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else if (isBreak) {
        timerRef.current = setInterval(() => {
          setBreakLeft((prevTime) => {
            if (prevTime <= 1) {
              endBreakAnimation();
              clearInterval(timerRef.current);
              setIsBreak(false);
              setFocusLeft(totalFocus);
              setIsFocus(true);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }
    }
    return () => clearInterval(timerRef.current);
  }, [
    isRunning,
    isFocus,
    isBreak,
    totalFocus,
    totalBreak,
    totalShortBreak,
    totalLongBreak,
    pomodoros,
  ]);

  const calcPercentage = (timeLeft, totalTime) => {
    return ((timeLeft / totalTime) * 100).toFixed(2);
  };

  const setFocus = (time) => {
    setTotalFocus(time);
    setFocusLeft(time);
  };

  const setBreak = (time) => {
    setTotalShortBreak(time);
    setBreakLeft(time);
  };

  const setLongBreak = (time) => {
    setTotalLongBreak(time);
    if (isLongBreak) {
      setBreakLeft(time);
    }
  };

  return (
    <>
      {showConfetti && (
        <PartyMode
          recycle={false}
          colors={[
            "#2dd4bf",
            "#0d9488",
            "#115e59",
            "#a78bfa",
            "#7c3aed",
            "#5b21b6",
          ]}
        />
      )}

      <CSSTransition in={fade} timeout={2000} classNames="fade" unmountOnExit>
        <div className="overlay"></div>
      </CSSTransition>

      <div
        className={`flex flex-col items-center justify-between h-screen mx-auto p-4 font-body text-lg transition-all duration-300 ${
          isFocus
            ? "bg-gradient-to-b from-violet-400 via-fuchsia-200 to-violet-400 text-violet-950"
            : isBreak
            ? "bg-gradient-to-b from-teal-300 via-lime-50 to-teal-300 text-teal-900"
            : "bg-gradient-to-b from-slate-400 via-slate-100 to-slate-400 text-slate-900"
        }`}
      >
        <div className="flex justify-between w-full">
          <div>
            {volume > 0 ? (
              <IoVolumeHigh className="text-2xl" />
            ) : (
              <IoVolumeMute className="text-2xl" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step=".1"
              value={volume}
              onChange={handleVolumeChange}
              className="rotate-[-90deg] absolute top-24 left-[-40px] "
            />
          </div>
          <Button handleClick={toggleTimer}>
            {isRunning
              ? "Pause"
              : isBreak
              ? "Resume"
              : isFocus
              ? "Resume"
              : "Start"}
          </Button>
        </div>

        <div className="relative flex justify-center items-center">
          <div className="rotate-[-90deg]">
            <CircularProgress
              percentage={calcPercentage(focusLeft, totalFocus)}
              strokeColor="#5b21b6"
            />
          </div>

          <div className="absolute w-40 h-40 rounded-full text-center flex flex-col justify-center items-center mx-auto">
            <p>Focus</p>
            {(isFocus || !started) && (
              <Countdown
                percentage={calcPercentage(focusLeft, totalFocus)}
                timeLeft={focusLeft}
                fillColor="#2e1065"
                baseColor="#6d28d9"
              />
            )}
          </div>
        </div>

        <p>Pomodoros Completed: {pomodoros}</p>

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

        <div>
          <form className="flex items-center justify-between w-full p-4">
            <Modifier
              label="Focus Sessions"
              name="focus"
              value={totalFocus}
              handleChange={setFocus}
            />
            <Modifier
              label="Short Breaks"
              name="shortbreak"
              value={totalShortBreak}
              handleChange={setBreak}
            />
            <Modifier
              label="Long Breaks"
              name="longbreak"
              value={totalLongBreak}
              handleChange={setLongBreak}
            />
          </form>
          <p>Time is in minutes. Every fourth break is a long break.</p>
        </div>
      </div>
    </>
  );
}

export default App;
