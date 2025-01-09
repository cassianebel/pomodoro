const Modifier = ({ label, name, value, handleChange }) => {
  return (
    <div className="flex flex-col items-center">
      <label htmlFor={name}>{label}</label>
      <input
        type="number"
        min="1"
        max="60"
        step="1"
        name={name}
        value={value / 60}
        onChange={(e) => handleChange(e.target.value * 60)}
        className="block min-w-min py-1 px-3 bg-slate-500 bg-opacity-20 shadow-inner-dark rounded-md"
      />
    </div>
  );
};

export default Modifier;
