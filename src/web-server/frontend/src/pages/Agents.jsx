import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import HeaderWithMenu from '../components/HeaderWithMenu';
import Footer from '../components/Footer';
import Modal from '../components/ui/Modal';
import InfoBlock from '../components/ui/InfoBlock';
import ErrorBlock from '../components/ui/ErrorBlock';
import toast, { Toaster } from 'react-hot-toast';
import { getAgents } from '../js/api';
import Logout from '../components/Logout';
import ChangeAdminPassword from '../components/ChangeAdminPassword';
import { HiArrowRight } from "react-icons/hi";
import ButtonLink from '../components/ui/ButtonLink';


const Agents = () => {
    // use navigate for logout success
    const navigate = useNavigate();

    // context related content
    const { setIsLoggedIn } = useAuth();

    // Create a ref to track the modal content
    const modalRef = useRef(null);
    // State to handle modal visibility
    const [showModal, setShowModal] = useState(false);
    // State to store the timeout ID
    const [timeoutId, setTimeoutId] = useState(null);
    // Handlers to open and close the modal
    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    // menu options
    const [option, setOption] = useState(null);
    const menu_options = [
        { label: 'Update Admin Password' },
        { label: 'Logout' },
    ];

    // Handler to act on header menu
    const handleMenuClick = (optionIndex) => {
        setOption(optionIndex);
        handleShow();
    };

    // Handler on successful logout
    const onLogoutSuccess = () => {
        setIsLoggedIn(false);
        navigate('/');
        handleClose();
    };

    // Handler on successful password change
    const onChangePasswordSuccess = () => {
        toast('Password updated');
        handleClose();
    };

    // List of agents related states & functions
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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


    // Fetch agents on component mount
    useEffect(() => {
        const fetchAgents = async () => {
            setLoading(true);
            try {
                const responsedata = await getAgents();
                if (responsedata && responsedata.list) {
                    setAgents(responsedata.list);
                }
            } catch (error) {
                setError(error.toString());
            } finally {
                setLoading(false);
            }
        };
        // get the agents
        fetchAgents();
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <HeaderWithMenu options={menu_options} onMenuClick={handleMenuClick} />
            <div className="flex flex-grow flex-col justify-start items-center bg-gray-50 p-4">
                <div className="w-full max-w-3xl">
                    <div className="flex border-b border-gray-300 pb-4">
                        <div className="text-2xl font-semibold text-gray-800">List of Agents</div>
                        <div className="flex-grow text-right">
                            <Link to="/agent/">
                                <ButtonLink>Create Agent</ButtonLink>
                            </Link>
                        </div>
                    </div>
                    {agents.length === 0 && !error && (
                        <div className="mt-4">
                            <InfoBlock>No agent has been created.</InfoBlock>
                        </div>
                    )}
                    {agents.length > 0 && (
                        <div className="flex flex-col gap-4 mt-4">
                            {agents.map((ag, index) => (
                                <div key={index} className="flex gap-4 text-xl font-normal items-center">
                                    <span className="text-gray-800">{index + 1}.</span>
                                    <Link to={`/agent/${ag.name}`}><span className="text-blue-600 font-medium">{ag.name}</span></Link>
                                    <span className="flex-1"></span>
                                    <Link to={`/demo/${ag.name}`} className="cursor-pointer"><div className="flex p-4 gap-2 items-center">
                                        <span className="text-blue-600">demo</span>
                                        <HiArrowRight />
                                    </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                    {error && (
                        <div className="mt-4">
                            <ErrorBlock>{error}</ErrorBlock>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            <Toaster
                position="bottom-center"
                gutter={8}
                toastOptions={{
                    className: "bg-gray-800 text-gray-100",
                    duration: 2000,
                }}
            />
            {showModal && (
                <Modal ref={modalRef}>
                    {option === 0 && (
                        <ChangeAdminPassword onSuccess={onChangePasswordSuccess} />
                    )}
                    {option === 1 && <Logout onSuccess={onLogoutSuccess} />}
                </Modal>
            )}
        </div>
    );
};

export default Agents;
