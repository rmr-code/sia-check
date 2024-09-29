import HeaderWithLink from '../components/HeaderWithLink';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Invalid = () => {
  return (
    <div className="flex flex-col h-screen">
      <HeaderWithLink link="/agents" />
      <div className="flex flex-grow flex-col justify-center items-center bg-gray-50 p-4">
        <div className="w-full max-w-md p-8">
          <h1 className="text-2xl font-thin text-gray-800 mb-6 text-center">
            There is no such Page
          </h1>
        </div>
        <Link to="/agents" className="text-base text-blue-600 font-normal">Return to Home</Link>
      </div>
      <Footer />
    </div>
  );
};

export default Invalid;
