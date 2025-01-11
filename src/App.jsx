import { useState, useEffect, useRef } from "react";
import * as dateFns from "date-fns";
import { Howl } from "howler";
import PartyMode from "react-confetti";
import { CSSTransition } from "react-transition-group";
import { IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { MdModeNight, MdLightMode } from "react-icons/md";
import CircularProgress from "./Components/CircularProgress";
import Countdown from "./Components/Countdown";
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

  const today = new Date();
  const dailyPomodoros = sessions.filter(
    (session) =>
      new Date(session.timestamp).toDateString() === today.toDateString()
  );

  const startOfWeek = dateFns.startOfWeek(today);
  const endOfWeek = dateFns.endOfWeek(today);
  const weeklyPomodoros = sessions.filter(
    (session) =>
      new Date(session.timestamp) >= startOfWeek &&
      new Date(session.timestamp) <= endOfWeek
  );

  const monthlyPomodoros = sessions.filter(
    (session) =>
      new Date(session.timestamp).getMonth() === today.getMonth() &&
      new Date(session.timestamp).getFullYear() === today.getFullYear()
  );

  const yearlyPomodoros = sessions.filter(
    (session) =>
      new Date(session.timestamp).getFullYear() === today.getFullYear()
  );

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

  const calcPercentage = (timeLeft, totalTime) => {
    return ((timeLeft / totalTime) * 100).toFixed(2);
  };

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
          <div className="relative flex justify-center items-center">
            <div className="rotate-[-90deg]">
              <CircularProgress
                darkMode={darkMode}
                percentage={calcPercentage(timer.focusLeft, timer.totalFocus)}
                strokeColor={darkMode ? "#8b5cf6" : "#5b21b6"}
              />
            </div>

            <div className="absolute w-40 h-40 rounded-full text-center flex flex-col justify-center items-center mx-auto">
              <p>FOCUS</p>
              {(isFocus || !started) && (
                <Countdown
                  percentage={calcPercentage(timer.focusLeft, timer.totalFocus)}
                  timeLeft={timer.focusLeft}
                  fillColor={darkMode ? "#8b5cf6" : "#2e1065"}
                  baseColor={darkMode ? "#a78bfa" : "#6d28d9"}
                />
              )}
            </div>
          </div>

          <div className="mx-14 my-7">
            <h1 className="font-display text-2xl text-center">
              Pomodoros Completed
            </h1>
            <div className="flex items-center gap-14 text-center leading-none">
              <p>
                <span className="font-display text-2xl">
                  {dailyPomodoros.length}
                </span>
                <br />
                Today
              </p>
              <p>
                <span className="font-display text-2xl">
                  {weeklyPomodoros.length}
                </span>
                <br />
                Week
              </p>
              <p>
                <span className="font-display text-2xl">
                  {monthlyPomodoros.length}
                </span>
                <br />
                {dateFns.format(today, "MMMM")}
              </p>
              <p>
                <span className="font-display text-2xl">
                  {yearlyPomodoros.length}
                </span>
                <br />
                {dateFns.format(today, "yyyy")}
              </p>
            </div>
          </div>

          <div className="relative flex justify-center items-center">
            <div className="rotate-[-90deg]">
              <CircularProgress
                darkMode={darkMode}
                percentage={calcPercentage(timer.breakLeft, timer.totalBreak)}
                strokeColor={darkMode ? "#2dd4bf" : "#115e59"}
              />
            </div>
            <div className="absolute w-40 h-40 rounded-full text-center flex flex-col justify-center items-center mx-auto">
              <p>BREAK</p>
              {isBreak && (
                <Countdown
                  percentage={calcPercentage(timer.breakLeft, timer.totalBreak)}
                  timeLeft={timer.breakLeft}
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
