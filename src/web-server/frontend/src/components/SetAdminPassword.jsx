import { useState, useEffect, useRef, FormEvent } from 'react';

import Card from './ui/Card';
import Title from './ui/Title';
import InfoBlock from './ui/InfoBlock';
import ErrorBlock from './ui/ErrorBlock';
import InputText from './ui/InputText';
import InputPassword from './ui/InputPassword';
import ButtonFilled from './ui/ButtonFilled';
import { setAdminPassword } from '../js/api';

const SetAdminPassword = ({ onSuccess }) => {
  // refs
  const passwordRef = useRef(null);
  // states inside the form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  // State to store the timeout ID
  const [timeoutId, setTimeoutId] = useState(null);

  // Handler for form submit
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    // check for errors before calling api
    if (!password || !confirmPassword) {
      setError('Both password fields are required.');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match.');
    } else if (password.length < 6) {
      setError('Password must be at least 6 characters.');
    } else {
      setError('');
      try {
        // call api method
        await setAdminPassword(password);
        // call onSuccess
        onSuccess();
      } catch (err) {
        setError(err);
      }
    }
  };

  // use effect to show modal after 3 secs
  useEffect(() => {
    // Set a timeout and store its ID
    const id = setTimeout(() => {
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
    }, 1000);

    // Save the timeout ID to state
    setTimeoutId(id);

    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      clearTimeout(id);
    };
  }, []);

  return (
    <Card>
      <Title>Set Admin Password</Title>
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-6">
          <InputPassword
            ref={passwordRef}
            id="password"
            label="Admin Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter the password"
            required
          />
          <InfoBlock>
            <div>Set a strong password of min 6 characters.</div>
          </InfoBlock>
        </div>
        <InputText
          id="confirm-password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Re-type your password"
          required
        />
        <div className="space-y-6">
          {error && (<ErrorBlock>{error}</ErrorBlock>)}
          <ButtonFilled type="submit">
            <div>Set Password</div>
          </ButtonFilled>
        </div>
      </form>
    </Card>
  );
};

export default SetAdminPassword;