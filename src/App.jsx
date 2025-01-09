import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import PartyMode from "react-confetti";
import { CSSTransition } from "react-transition-group";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { MdModeNight, MdLightMode } from "react-icons/md";
import CircularProgress from "./Components/CircularProgress";
import Countdown from "./Components/Countdown";
import Button from "./Components/Button";
import Modifier from "./Components/Modifier";

function App() {
  const [darkMode, setDarkMode] = useState(false);
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
  const [partyModeDimensions, setPartyModeDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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

  useEffect(() => {
    if (localStorage.getItem("theme")) {
      if (localStorage.getItem("theme") === "dark") {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const preference = !darkMode;
    setDarkMode(!darkMode);
    localStorage.setItem("theme", preference ? "dark" : "light");
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

  useEffect(() => {
    const handleResize = () => {
      setPartyModeDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`App ${darkMode ? "dark" : "light"}`}>
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
          width={partyModeDimensions.width}
          height={partyModeDimensions.height}
        />
      )}

      <CSSTransition in={fade} timeout={2000} classNames="fade" unmountOnExit>
        <div className="overlay"></div>
      </CSSTransition>

      <div
        className={`flex flex-col items-center justify-between h-screen mx-auto p-4 font-body text-lg transition-all duration-300 ${
          isFocus
            ? "bg-gradient-to-b from-violet-500 via-violet-300 to-violet-500 text-violet-950 dark:from-violet-950 dark:via-violet-800 dark:to-violet-950 dark:text-violet-300"
            : isBreak
            ? "bg-gradient-to-b from-teal-500 via-teal-200 to-teal-500 text-teal-950 dark:from-teal-950 dark:via-teal-800 dark:to-teal-950 dark:text-teal-300"
            : "bg-gradient-to-b from-slate-400 via-slate-100 to-slate-400 text-slate-900 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 dark:text-slate-300"
        }`}
      >
        <div className="flex justify-between w-full">
          <div className="flex flex-col items-center relative">
            {volume > 0 ? (
              <IoVolumeHigh className="text-2xl mt-1" />
            ) : (
              <IoVolumeMute className="text-2xl mt-1" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step=".1"
              value={volume}
              onChange={handleVolumeChange}
              className="rotate-[-90deg] absolute top-24 mozilla:top-36"
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
          <div>
            <button onClick={toggleTheme} className="rounded-full p-1">
              {darkMode ? (
                <MdLightMode className="text-2xl cursor-pointer" />
              ) : (
                <MdModeNight className="text-2xl cursor-pointer" />
              )}
            </button>
          </div>
        </div>

        <div
          id="timers"
          className="flex flex-col landscape:flex-row items-center justify-center flex-grow"
        >
          <div className="relative flex justify-center items-center">
            <div className="rotate-[-90deg]">
              <CircularProgress
                darkMode={darkMode}
                percentage={calcPercentage(focusLeft, totalFocus)}
                strokeColor={darkMode ? "#8b5cf6" : "#5b21b6"}
              />
            </div>

            <div className="absolute w-40 h-40 rounded-full text-center flex flex-col justify-center items-center mx-auto">
              <p>FOCUS</p>
              {(isFocus || !started) && (
                <Countdown
                  percentage={calcPercentage(focusLeft, totalFocus)}
                  timeLeft={focusLeft}
                  fillColor={darkMode ? "#8b5cf6" : "#2e1065"}
                  baseColor={darkMode ? "#a78bfa" : "#6d28d9"}
                />
              )}
            </div>
          </div>

          <p className="m-14">Pomodoros Completed: {pomodoros}</p>

          <div className="relative flex justify-center items-center">
            <div className="rotate-[-90deg]">
              <CircularProgress
                darkMode={darkMode}
                percentage={calcPercentage(breakLeft, totalBreak)}
                strokeColor={darkMode ? "#2dd4bf" : "#115e59"}
              />
            </div>
            <div className="absolute w-40 h-40 rounded-full text-center flex flex-col justify-center items-center mx-auto">
              <p>BREAK</p>
              {isBreak && (
                <Countdown
                  percentage={calcPercentage(breakLeft, totalBreak)}
                  timeLeft={breakLeft}
                  fillColor={darkMode ? "#14b8a6" : "#042f2e"}
                  baseColor={darkMode ? "#5eead4" : "#0f766e"}
                />
              )}
            </div>
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
    </div>
  );
}

export default App;
