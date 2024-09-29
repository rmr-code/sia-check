import Header from "../components/Header";
import Footer from "../components/Footer";

const Loading = () => {

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header />
            <div className="flex flex-grow flex-col justify-center items-center p-8">
                    <div className="text-2xl font-thin text-gray-800 mb-6 tracking-tight">Loading ...</div>
                </div>
            <Footer />
        </div>
    );
};

export default Loading;
