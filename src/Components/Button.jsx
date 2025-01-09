const Button = ({ children, handleClick }) => {
  return (
    <button
      className="px-4 py-2 shadow m-2 rounded-md bg-white dark:bg-slate-950 bg-opacity-15 dark:bg-opacity-20 border border-white dark:border-opacity-15 border-opacity-25 border-b-transparent border-r-transparent uppercase font-bold"
      onClick={() => handleClick()}
    >
      {children}
    </button>
  );
};

export default Button;
