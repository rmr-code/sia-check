const ButtonPlain = ({
  type = 'button',
  children,
  width = 'auto',
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`flex justify-center px-4 py-2 text-base text-gray-800 font-semibold rounded-md cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed hover:bg-gray-200 focus:outline-none ${width}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default ButtonPlain;
