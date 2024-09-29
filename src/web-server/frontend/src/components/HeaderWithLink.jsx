import { Link } from 'react-router-dom';
import { HiOutlineX } from 'react-icons/hi';
import Logo from './Logo';

const HeaderWithLink = ({ link }) => {
  return (
    <header className="bg-gray-50 text-blue-600 p-4">
      <div className="container max-w-4xl mx-auto flex justify-between items-center">
        <Logo width={64} height={64}/>
        <Link to={link}>
          <HiOutlineX className="w-6 h-6 cursor-pointer" />
        </Link>
      </div>
    </header>
  );
};

export default HeaderWithLink;
