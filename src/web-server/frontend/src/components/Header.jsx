import Logo from "./Logo";

const Header = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-full max-w-md flex flex-col">
        <Logo />
      </div>
    </div>
  );
};

export default Header;