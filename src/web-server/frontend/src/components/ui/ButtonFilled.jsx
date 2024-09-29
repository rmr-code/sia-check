const ButtonFilled  = ({
  type = 'button',
  children,
  width = 'w-full',
  bgcolor = 'bg-blue-600',
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`flex justify-center px-4 py-2 ${bgcolor} text-white font-medium rounded-md shadow-sm  cursor-pointer disabled:cursor-not-allowed focus:outline-none ${width}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default ButtonFilled;
