import { useState, FormEvent, ChangeEvent } from 'react';

import Card from '../components/ui/Card';
import Title from '../components/ui/Title';
import InputPassword from './ui/InputPassword';
import InputText from './ui/InputText';
import InfoBlock from './ui/InfoBlock';
import ErrorBlock from './ui/ErrorBlock';
import ButtonFilled from './ui/ButtonFilled';
import { changeAdminPassword } from '../js/api';


const ChangeAdminPassword = ({ onSuccess }) => {
    // states inside the form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [error, setError] = useState(null);

    // Handler for form submit
    const handleSubmit = async (ev) => {
        ev.preventDefault();
        try {
            setError(null);

            // Validate new passwords
            if (!currentPassword || !newPassword || !repeatNewPassword) {
                setError('All fields are required.');
                return;
            }

            if (newPassword.length < 6) {
                setError('New password must be at least 6 characters.');
                return;
            }

            if (newPassword !== repeatNewPassword) {
                setError('New passwords do not match.');
                return;
            }

            // Make an API call to update the password
            await changeAdminPassword(currentPassword, newPassword);
            onSuccess();
        } catch (err) {
            setError(err.toString());
        }
    };

    return (
        <Card>
            <Title>Change Admin Password</Title>
            <form onSubmit={handleSubmit} className="space-y-12">
                <InputPassword
                    id="current-password"
                    label="Current Password"
                    value={currentPassword}
                    onChange={ (e) => setCurrentPassword(e.target.value) }
                    placeholder="Enter the current password"
                    required
                />
                <InputPassword
                    id="new-password"
                    label="New Password"
                    value={newPassword}
                    onChange={ (e) => setNewPassword(e.target.value) }
                    placeholder="Enter a new password"
                    required
                />
                <InfoBlock>
                    <div>Set a strong password of min 6 characters.</div>
                </InfoBlock>
                <InputText
                    id="confirm-password"
                    label="Repeat new Password"
                    value={repeatNewPassword}
                    onChange={ (e) => setRepeatNewPassword(e.target.value) }
                    placeholder="Re-type your password"
                    required
                />
                <div className="space-x-6">
                {error && (<ErrorBlock>{error}</ErrorBlock>)}
                    <ButtonFilled type="submit">
                        <div>Update Password</div>
                    </ButtonFilled>
                </div>
            </form>
        </Card>
    );
};

export default ChangeAdminPassword;
