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
        className="block w-14 p-2 bg-slate-500 bg-opacity-20 shadow-inner rounded-md"
      />
    </div>
  );
};

export default Modifier;
