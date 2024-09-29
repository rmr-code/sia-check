import { useState, useEffect } from 'react';
// import context
import { AuthProvider, useAuth } from './contexts/authcontext';
// import route related functions
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
// import api
import { checkAdminPasswordStatus, checkToken } from './js/api';

// import pages
import Loading from './pages/Loading';
import Error from './pages/Error';
import Invalid from './pages/Invalid';
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Agents from "./pages/Agents";
import Agent from './pages/Agent';
import Chat from './pages/Chat';
import Demo from './pages/Demo';

// this was made to use this component after the provider
// so that the useEffect can use provider methods or states
const AppContent = () => {

  const location = useLocation();

  // from auth context
  // the below 2 states are received from auth context
  const {
    isAdminPasswordSet,
    isLoggedIn,
    setIsAdminPasswordSet,
    setIsLoggedIn
  } = useAuth();


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initCheck = async () => {
      try {
        const pwdata = await checkAdminPasswordStatus();
        // check if admin is set
        if (pwdata.admin_password_set) {
          setIsAdminPasswordSet(true);
          await checkToken();
          // if it does not throw an error
          setIsLoggedIn(true)
        }
        else {
          setIsAdminPasswordSet(false);
        }
      } catch (err) {
        // set error only if password not set
        //if(!isAdminPasswordSet) {
        //  setError(err.message || 'An error occurred'); 
        //}
      } finally {
        setLoading(false)
      }
    };
    initCheck();

  }, [setIsAdminPasswordSet, setIsLoggedIn])

  // if its loading
  if (loading) {
    return <Loading />
  }
  // if there is an error
  if (error) {
    return <Error error={error}/>
  }

  return (
    <Routes>
    {!isAdminPasswordSet ? (
      <>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="*" element={<Navigate to="/welcome" />} />
      </>
    ) : !isLoggedIn ? (
      <>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat/" element={<Chat />} />
        <Route path="/chat/:agent" element={<Chat />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </>
    ) : (
      <>
        <Route path="/" element={<Navigate to="/agents" replace />} />
        <Route path="/agents/" element={<Agents />} />
        <Route path="/agent/:agentname" element={<Agent />} />
        <Route path="/agent/" element={<Agent />} />
        <Route path="/demo/" element={<Demo />} />
        <Route path="/demo/:agentname" element={<Demo />} />
        <Route path="/chat/" element={<Chat />} />
        <Route path="/chat/:agentname" element={<Chat />} />
        <Route path="*" element={<Invalid />} />
      </>
    )}
  </Routes>
  )
}


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
