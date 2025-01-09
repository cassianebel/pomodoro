const Button = ({ children, handleClick }) => {
  return (
    <button
      className="px-4 py-2 shadow m-2 rounded-md bg-white bg-opacity-15 border border-white border-opacity-25 border-b-transparent border-r-transparent uppercase font-bold"
      onClick={() => handleClick()}
    >
      {children}
    </button>
  );
};

export default Button;
