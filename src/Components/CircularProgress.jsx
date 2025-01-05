import { useEffect, useState } from "react";

const CircularProgress = ({ percentage }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={120} height={120}>
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="transparent"
        stroke="#e6e6e6"
        strokeWidth="8"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="transparent"
        stroke="#4caf50"
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: "stroke-dashoffset 0.35s ease" }}
      />
    </svg>
  );
};

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(100);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  return (
    <div>
      <CircularProgress percentage={timeLeft} />
      <p>{timeLeft}%</p>
    </div>
  );
};

export default Timer;
