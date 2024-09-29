const SectionTitle = ({className = '', children}) => {
  return (
    <div className={`text-2xl font-semibold text-gray-800 ${className}`}>
      {children}
    </div>
  );
};

export default SectionTitle;
