import { useState, useRef, useEffect } from 'react';

import Card from '../ui/Card';
import Title from '../ui/Title';
import InputTextArea from '../ui/InputTextarea';
import InfoBlock from '../ui/InfoBlock';
import ErrorBlock from '../ui/ErrorBlock';
import ButtonFilled from '../ui/ButtonFilled';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';

const WelcomeMessageEdit = ({
  value,
  prev,
  next,
  onSuccess,
}) => {
  const inputRef = useRef(null);
  // states inside the form
  const [welcomeMessage, setWelcomeMessage] = useState(value);
  const [error, setError] = useState(null);

  const info = 'Keep it short and encouraging';

  // Handler for DONE
  const handleSubmit = (ev) => {
    ev.preventDefault();
    onSuccess(welcomeMessage, '');
  };

  // Handler for PREV field
  const handlePrev = () => {
    onSuccess(welcomeMessage, prev);
  };

  // Handler for NEXT field
  const handleNext = () => {
    onSuccess(welcomeMessage, next);
  };

  useEffect(() => {
    // Focus the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Card>
      <div className="w-full max-w-lg">
        <div className="flex w-full gap-4 items-center mb-4">
          {prev ? (
            <HiArrowLeft
              className="text-xl font-medium text-blue-500 cursor-pointer"
              title={prev}
              onClick={handlePrev}
            />
          ) : (
            ''
          )}
          <div className="flex-1 justify-center">
            <Title className="mb-0">Welcome Message</Title>
          </div>
          {next && (
            <HiArrowRight
              className="text-xl font-medium text-blue-500 cursor-pointer"
              onClick={handleNext}
              title={next}
            />
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputTextArea
            ref={inputRef}
            id="welcome-message"
            label=""
            value={welcomeMessage}
            onChange={(e) =>
              setWelcomeMessage(e.target.value)
            }
            rows={4}
          />
          <InfoBlock>{info}</InfoBlock>
          {error && <ErrorBlock>{error}</ErrorBlock>}
          <div className="flex justify-between gap-4 items-center">
            <div className="w-1/3 text-left flex space-x-2 font-medium text-gray-500"></div>
            <div className="w-1/3 text-center">
              <ButtonFilled type="submit">Done</ButtonFilled>
            </div>
            <div className="w-1/3 text-right flex space-x-2 font-medium text-gray-500"></div>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default WelcomeMessageEdit;
