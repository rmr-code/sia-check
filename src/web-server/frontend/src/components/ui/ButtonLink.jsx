const ButtonLink = ({
  children,
  size = 'text-base',
  ...rest
}) => {
  return (
    <button
      className={`text-base text-blue-600 font-normal hover:bg-gray-100 p-2 cursor-pointer disabled:cursor-not-allowed ${size}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default ButtonLink;
