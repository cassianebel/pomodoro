import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import PartyMode from "react-confetti";
import { CSSTransition } from "react-transition-group";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { MdModeNight, MdLightMode } from "react-icons/md";
import CompletedSessions from "./Components/CompletedSessions";
import Timer from "./Components/Timer";
import Button from "./Components/Button";
import Modifier from "./Components/Modifier";
import Worker from "./timerWorker.js?worker";

const FOCUS_TIME = localStorage.getItem("focusTime") * 60 || 25 * 60; // 25 minutes
const SHORT_BREAK_TIME = localStorage.getItem("breakTime") * 60 || 5 * 60; // 5 minutes
const LONG_BREAK_TIME = localStorage.getItem("longBreakTime") * 60 || 15 * 60; // 15 minutes

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [started, setStarted] = useState(false);
  const [pomodoros, setPomodoros] = useState(0); // used for calculating long break
  const [sessions, setSessions] = useState(() => {
    const savedSessions = localStorage.getItem("pomodoroSessions");
    return savedSessions ? JSON.parse(savedSessions) : [];
  }); // used for calculating daily, weekly, monthly, yearly stats
  const [timer, setTimer] = useState({
    totalFocus: FOCUS_TIME,
    focusLeft: FOCUS_TIME,
    totalBreak: SHORT_BREAK_TIME,
    totalShortBreak: SHORT_BREAK_TIME,
    totalLongBreak: LONG_BREAK_TIME,
    breakLeft: 0,
  });
  const [isFocus, setIsFocus] = useState(false);
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

  const popRef = useRef(null);
  const chimeRef = useRef(null);
  const workerRef = useRef(null);

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

  const endFocusAnimation = () => {
    if (popRef.current) {
      popRef.current.play();
      setTimeout(() => popRef.current.stop(), 3000);
    }
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const endBreakAnimation = () => {
    if (chimeRef.current) {
      chimeRef.current.play();
      setTimeout(() => chimeRef.current.stop(), 3000);
    }
    setFade(true);
    setTimeout(() => setFade(false), 100);
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
    setIsRunning((prevIsRunning) => !prevIsRunning);
    if (!isFocus && !isBreak) {
      setIsFocus(true);
    }
  };

  useEffect(() => {
    localStorage.setItem("pomodoroSessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    workerRef.current = new Worker();

    workerRef.current.onmessage = () => {
      setTimer((prevTimer) => {
        if (isFocus) {
          if (prevTimer.focusLeft <= 1) {
            endFocusAnimation();
            setIsFocus(false);
            setSessions((prevSessions) => [
              ...prevSessions,
              {
                timestamp: new Date().toISOString(),
                minutes: Math.ceil(prevTimer.totalFocus / 60),
              },
            ]);
            setPomodoros((prevPomodoros) => prevPomodoros + 1);
            let poms = pomodoros + 1;
            if (poms % 4 === 0) {
              setTimer((prevTimer) => ({
                ...prevTimer,
                breakLeft: prevTimer.totalLongBreak,
              }));
              setIsLongBreak(true);
            } else {
              setTimer((prevTimer) => ({
                ...prevTimer,
                breakLeft: prevTimer.totalShortBreak,
              }));
              setIsLongBreak(false);
            }
            setIsBreak(true);
            return { ...prevTimer, focusLeft: 0 };
          }
          return { ...prevTimer, focusLeft: prevTimer.focusLeft - 1 };
        } else if (isBreak) {
          if (prevTimer.breakLeft <= 1) {
            endBreakAnimation();
            setIsBreak(false);
            setTimer((prevTimer) => ({
              ...prevTimer,
              focusLeft: prevTimer.totalFocus,
            }));
            setIsFocus(true);
            setIsRunning(true);
            return { ...prevTimer, breakLeft: 0 };
          }
          return { ...prevTimer, breakLeft: prevTimer.breakLeft - 1 };
        }
      });
    };

    return () => {
      workerRef.current.terminate();
    };
  }, [isFocus, isBreak, pomodoros]);

  useEffect(() => {
    if (workerRef.current) {
      if (isRunning) {
        if (isFocus || isBreak) {
          workerRef.current.postMessage({ action: "start", interval: 1000 });
        }
      } else {
        workerRef.current.postMessage({ action: "stop" });
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ action: "stop" });
      }
    };
  }, [isRunning, isFocus, isBreak]);

  const setFocus = (time) => {
    localStorage.setItem("focusTime", time);
    setTimer((prevTimer) => ({
      ...prevTimer,
      totalFocus: time * 60,
      focusLeft: time * 60,
    }));
  };

  const setBreak = (time) => {
    localStorage.setItem("breakTime", time);
    setTimer((prevTimer) => ({
      ...prevTimer,
      totalBreak: time * 60,
      totalShortBreak: time * 60,
      breakLeft: time * 60,
    }));
  };

  const setLongBreak = (time) => {
    localStorage.setItem("longBreakTime", time);
    if (isLongBreak) {
      setTimer((prevTimer) => ({
        ...prevTimer,
        totalBreak: time * 60,
        totalLongBreak: time * 60,
        breakLeft: time * 60,
      }));
    } else {
      setTimer((prevTimer) => ({
        ...prevTimer,
        totalLongBreak: time * 60,
      }));
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
        className={`flex flex-col items-center justify-between min-h-screen mx-auto p-4 font-body text-lg transition-all duration-300 ${
          isFocus && isRunning
            ? "bg-gradient-to-b from-violet-500 via-violet-300 to-violet-500 text-violet-950 dark:from-violet-950 dark:via-violet-800 dark:to-violet-950 dark:text-violet-300"
            : isBreak && isRunning
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
          className="w-full flex flex-col landscape:flex-row items-center justify-center landscape:justify-evenly flex-grow"
        >
          <Timer
            name="FOCUS"
            darkMode={darkMode}
            isType={isFocus}
            started={started}
            typeLeft={timer.focusLeft}
            totalType={timer.totalFocus}
            strokeColors={["#8b5cf6", "#5b21b6"]}
            fillColors={["#8b5cf6", "#2e1065"]}
            baseColors={["#a78bfa", "#6d28d9"]}
          />

          <CompletedSessions sessions={sessions} />

          <Timer
            name="BREAK"
            darkMode={darkMode}
            isType={isBreak}
            started={started}
            typeLeft={timer.breakLeft}
            totalType={timer.totalBreak}
            strokeColors={["#2dd4bf", "#115e59"]}
            fillColors={["#14b8a6", "#042f2e"]}
            baseColors={["#5eead4", "#0f766e"]}
          />
        </div>

        <div>
          <form className="flex items-center justify-between w-full p-4">
            <Modifier
              label="Focus Sessions"
              name="focus"
              value={timer.totalFocus}
              handleChange={setFocus}
            />
            <Modifier
              label="Short Breaks"
              name="shortbreak"
              value={timer.totalShortBreak}
              handleChange={setBreak}
            />
            <Modifier
              label="Long Breaks"
              name="longbreak"
              value={timer.totalLongBreak}
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
