import { useState } from 'react';

import { logout } from '../js/api';
import Card from '../components/ui/Card';
import Title from '../components/ui/Title';
import InfoBlock from './ui/InfoBlock';
import ErrorBlock from './ui/ErrorBlock';
import ButtonFilled from './ui/ButtonFilled';

const Logout = ({ onSuccess }) => {
    const [error, setError] = useState(null);

    const handleLogout = async (ev) => {
        ev.preventDefault();
        try {
            // Clear the cookie by calling the backend logout API
            await logout();

            // Call on success
            onSuccess();
        } catch (err) {
            setError(err.toString(0));
        }
    }

    return (
        <Card>
            <Title>Confirm Logout</Title>
            <div className="space-y-12">
            {!error && <InfoBlock>All local data will be cleared. Confirm logout.</InfoBlock>}
            <div className="space-y-6">
                {error && (<ErrorBlock>{error}</ErrorBlock>)}

                <ButtonFilled type="button" bgcolor="bg-red-500" onClick={handleLogout}>
                    Yes, I wish to logout
                </ButtonFilled>
            </div>
            </div>
        </Card>
    );
}

export default Logout;
