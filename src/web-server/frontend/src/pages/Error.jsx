import Header from "../components/Header";
import Footer from "../components/Footer";
import ErrorBlock from "../components/ui/ErrorBlock";

const Error = ({error}) => {

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header />
            <div className="flex flex-grow flex-col justify-center items-center p-8">
                <ErrorBlock>{error}</ErrorBlock>
            </div>
            <Footer />
        </div>
    );
};

export default Error;
