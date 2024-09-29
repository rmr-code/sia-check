const Card = ({ children }) => {
  return (
    <div className="w-full min-w-64 md:min-w-96 bg-white p-8 rounded-lg shadow-lg">
      {children}
    </div>
  );
};

export default Card;
