const CircularProgress = ({ percentage, strokeColor }) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={200} height={200}>
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="transparent"
        stroke="rgb(256 256 256 / 50%)"
        strokeWidth="4"
      />
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="transparent"
        stroke={strokeColor || "#4caf50"}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: "stroke-dashoffset 0.35s ease" }}
      />
    </svg>
  );
};

export default CircularProgress;
