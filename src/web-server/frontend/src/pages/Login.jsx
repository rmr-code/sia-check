import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import Modal from "../components/ui/Modal";

import { useAuth } from "../contexts/authcontext";

import AskAdminPassword from "../components/AskAdminPassword";

const Login = () => {
    // navigate
    const navigate = useNavigate();

    // Context-related content
    const { setIsLoggedIn } = useAuth();

    // ref for modal component
    const modalRef = useRef(null);

    // State to handle modal visibility
    const [showModal, setShowModal] = useState(false);
    // State to store the timeout ID
    const [timeoutId, setTimeoutId] = useState(null);


    // Handlers to open and close the modal
    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    // on modal submit
    const onSuccess = () => {
        setIsLoggedIn(true);
        navigate('/agents');
    }

    // Function to call the modal
    const modalTrigger = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        handleShow();
    };

    // Close modal on outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleClose();
            }
        };

        if (showModal) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [showModal]);

    // use effect to show modal after 3 secs
    useEffect(() => {
        // Set a timeout and store its ID
        const id = setTimeout(() => {
            handleShow();
        }, 3000);

        // Save the timeout ID to state
        setTimeoutId(id);

        // Cleanup function to clear the timeout if the component unmounts
        return () => {
            clearTimeout(id);
        };
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header/>
            <div className="flex flex-grow flex-col justify-center items-center p-8">
                <div className="w-full max-w-md flex flex-col">
                    <div className="text-4xl font-bold text-gray-800 mb-6 tracking-tight">Login.</div>
                    <div className="text-gray-800 font-normal">
                        <span className="py-2 cursor-pointer text-blue-600" onClick={modalTrigger}>Enter the admin password</span><span className="py-2"> to set your agents.</span>
                    </div>
                </div>
            </div>
            <Footer />
            {showModal && (
                <Modal ref={modalRef}>
                    <AskAdminPassword onSuccess={onSuccess} />
                </Modal>
            )}
        </div>
    );
};

export default Login;
