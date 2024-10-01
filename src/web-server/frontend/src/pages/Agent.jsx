import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { getAgent, saveAgent } from '../js/api';
import toast, { Toaster } from 'react-hot-toast';

import Logo from '../components/Logo';
import Footer from '../components/Footer';
import Modal from '../components/ui/Modal';
import NameView from '../components/agent/NameView';
import NameEdit from '../components/agent/NameEdit';
import InstructionsView from '../components/agent/InstructionsView';
import InstructionsEdit from '../components/agent/InstructionsEdit';
import WelcomeMessageView from '../components/agent/WelcomeMessageView';
import WelcomeMessageEdit from '../components/agent/WelcomeMessageEdit';
import SuggestedPromptsView from '../components/agent/SuggestedPromptsView';
import SuggestedPromptsEdit from '../components/agent/SuggestedPromptsEdit';
import FilesView from '../components/agent/FilesView';
import FilesEdit from '../components/agent/FilesEdit';
import ButtonFilled from '../components/ui/ButtonFilled';
import ButtonPlain from '../components/ui/ButtonPlain';
import InfoBlock from '../components/ui/InfoBlock';
import ErrorBlock from '../components/ui/ErrorBlock';

const Agent = () => {
  const { agentname } = useParams();

  const navigate = useNavigate();

  // State for agent data and form inputs
  const [agentData, setAgentData] = useState({
    name: '',
    instructions: '',
    welcome_message: '',
    suggested_prompts: '',
    files: '',
    status: '',
    embeddings_status: '',
    created_on: null,
    updated_on: null,
  });
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [suggestedPrompts, setSuggestedPrompts] = useState('');
  const [files, setFiles] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState('');
  const [embeddingsStatus, setEmbeddingsStatus] = useState('');

  // State for UI interactions
  //const [canEdit, setCanEdit] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false); // state when changes have been made
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [field, setField] = useState(null);

  const modalRef = useRef(null);

  // Placeholders for fields
  const namePlaceholder = 'set-a-name';
  const instructionsPlaceholder = `
This is an example of an instruction:

Follow the **below** instructions:  
1. You are an expert in policy analysis. Answer questions based solely on the provided documents.
2. If the information is insufficient, ask for more details.
3. Do not speculate or provide information that is not explicitly found in the documents. If multiple possible answers exist, list the options.
`;
  const welcomeMessagePlaceholder = `
This is an example of a welcome message:

Welcome to the **Insurance Policy Assistant**!
I’m here to help you navigate your insurance needs and provide expert advice on various policy matters. Whether you’re looking for information on coverage options, policy terms, claim processes, or any other insurance-related questions, I’m here to assist you.
`;
  const suggestedPromptsPlaceholder = `How do I file a claim for car damage?, Can I change my beneficiaries on my life insurance policy?, Is flood damage covered under my homeowner’s insurance?`;
  const filesPlaceholder = 'Here you should upload all files that you would like the agent to process to serve its needs.';

  // Editable fields
  const fields = [
    !agentname && 'name',
    'instructions',
    'welcomeMessage',
    'suggestedPrompts',
    'files',
  ].filter(Boolean);

  const prevField = () => {
    const index = fields.indexOf(field);
    return index > 0 ? fields[index - 1] : '';
  };

  const nextField = () => {
    const index = fields.indexOf(field);
    return index >= 0 && index < fields.length - 1 ? fields[index + 1] : '';
  };

  // Modal handlers
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  // State to store the timeout ID
  const [timeoutId, setTimeoutId] = useState(null);


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

  // Initial load effect
  useEffect(() => {
    if (!agentname) {
      toast('The above content is placeholder text to serve as an example.');
      // Set a timeout and store its ID
      const id = setTimeout(() => {
        setField('name');
        handleShow();
      }, 5000);

      // Save the timeout ID to state
      setTimeoutId(id);

      // Cleanup function to clear the timeout if the component unmounts
      return () => {
        clearTimeout(id);
      };
    }
  }, [agentname]);

  // Fetch agent data
  useEffect(() => {
    const fetchAgent = async () => {
      setIsLoading(true);
      try {
        const responsedata = await getAgent(agentname);
        // check and set values
        if (responsedata && responsedata.agent) {
          const data = responsedata.agent;
          setAgentData(data);
          setName(data.name);
          setInstructions(data.instructions);
          setWelcomeMessage(data.welcome_message);
          setSuggestedPrompts(data.suggested_prompts);
          setFiles(data.files);
          setEmbeddingsStatus(data.embeddings_status);
        }
      } catch (error) {
        setError(error.toString());
      } finally {
        setIsLoading(false);
      }
    };
    // check if not blank
    if (agentname) {
      fetchAgent();
    }
  }, [agentname]);

  // Edit handlers
  const handleEdit = (fieldName) => {
    if (fieldName) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setField(fieldName);
      handleShow();
    }
  };

  const storeName = (value, nextField) => {
    setIsEditMode(true);
    setName(value);
    nextField ? handleEdit(nextField) : handleClose();
  };

  const storeInstructions = (value, nextField) => {
    setIsEditMode(true);
    setInstructions(value);
    nextField ? handleEdit(nextField) : handleClose();
  };

  const storeWelcomeMessage = (value, nextField) => {
    setIsEditMode(true);
    setWelcomeMessage(value);
    nextField ? handleEdit(nextField) : handleClose();
  };

  const storeSuggestedPrompts = (value, nextField) => {
    setIsEditMode(true);
    setSuggestedPrompts(value);
    nextField ? handleEdit(nextField) : handleClose();
  };

  const storeFiles = (newFilesList, deletedFilesList, nextField) => {
    setIsEditMode(true);
    setNewFiles(newFilesList);
    setDeletedFiles(deletedFilesList);
    nextField ? handleEdit(nextField) : handleClose();
  };

  // Reset handler
  const handleReset = () => {
    setName(agentData.name);
    setInstructions(agentData.instructions);
    setWelcomeMessage(agentData.welcome_message);
    setSuggestedPrompts(agentData.suggested_prompts);
    setFiles(agentData.files);
    setNewFiles([]);
    setDeletedFiles('');
    setIsEditMode(false);
    setField(null);
  };

  // Save handler
  const handleSave = async () => {
    setError("");
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('instructions', instructions);
      formData.append('welcome_message', welcomeMessage);
      formData.append('suggested_prompts', suggestedPrompts);
      newFiles.forEach((file) => {
        formData.append('new_files', file);
      });
      formData.append('deleted_files', deletedFiles);
      const responsedata = await saveAgent(agentname, formData);
      setIsEditMode(false);
      if (responsedata && responsedata.agent) {
        // reload the agent due to single source of truth
        // check if new case
        if (agentname) {
          // update agent
          window.location.reload();
        }
        else {
          // new agent 
          navigate(`/agent/${responsedata.agent.name}`);
        }
      }
      else {
        // navigate to agents
        navigate(`/agents/`);
      }
    } catch (error) {
      setError(error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    window.location.reload();
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-50 p-4">
        <div className="container max-w-4xl mx-auto flex items-center">
          <Logo />
          <div className="flex-1" />
          <div className="flex gap-4">
            {!isEditMode && (
              <Link to="/agents">
                <ButtonPlain width="auto">Return to Agents</ButtonPlain>
              </Link>
            )}
            {embeddingsStatus &&
              <ButtonFilled width="auto" onClick={handleRefresh}>Refresh</ButtonFilled>
            }
            {!embeddingsStatus && isEditMode && !agentData.name && (
              <>
                <Link to="/agents">
                  <ButtonPlain>Return to Agents</ButtonPlain>
                </Link>
                <ButtonFilled width="auto" onClick={handleSave}>
                  Save
                </ButtonFilled>
              </>
            )}
            {!embeddingsStatus && isEditMode && agentData.name && (
              <>
                <ButtonPlain onClick={handleReset}>Reset</ButtonPlain>
                <ButtonFilled width="auto" onClick={handleSave}>
                  Save
                </ButtonFilled>
              </>
            )}
          </div>
        </div>
        {error &&
          <div className="float-right pr-4">
            <ErrorBlock>{error}</ErrorBlock>
          </div>
        }
        {embeddingsStatus &&
          <div className="float-right pr-4">
            <InfoBlock>Files are being processed ...</InfoBlock>
          </div>
        }

      </header>
      <div className="flex flex-grow flex-col items-center bg-gray-50 p-8">
        <div className="w-full max-w-3xl flex flex-col gap-8">
          <NameView
            data={agentData.name}
            value={name}
            placeholder={agentData.name ? '' : namePlaceholder}
            canEdit={!agentname}
            onEdit={() => handleEdit('name')}
            className="border-b border-gray-300 pb-2"
          />
          <InstructionsView
            data={agentData.instructions}
            value={instructions}
            placeholder={agentData.name ? '' : instructionsPlaceholder}
            canEdit={!embeddingsStatus}
            onEdit={() => handleEdit('instructions')}
          />
          <WelcomeMessageView
            data={agentData.welcome_message}
            value={welcomeMessage}
            placeholder={agentData.name ? '' : welcomeMessagePlaceholder}
            canEdit={!embeddingsStatus}
            onEdit={() => handleEdit('welcomeMessage')}
          />
          <SuggestedPromptsView
            data={agentData.suggested_prompts}
            value={suggestedPrompts}
            placeholder={agentData.name ? '' : suggestedPromptsPlaceholder}
            canEdit={!embeddingsStatus}
            onEdit={() => handleEdit('suggestedPrompts')}
          />
          <FilesView
            files={files}
            new_files={newFiles}
            deleted_files={deletedFiles}
            placeholder={agentData.name ? '' : filesPlaceholder}
            canEdit={!embeddingsStatus}
            onEdit={() => handleEdit('files')}
          />
        </div>
      </div>
      <Footer />
      <Toaster
        position="bottom-center"
        gutter={8}
        toastOptions={{
          className: 'text-center',
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      {showModal && (
        <Modal ref={modalRef}>
          {field === 'name' && (
            <NameEdit
              value={name}
              onSuccess={storeName}
              next={nextField()}
              prev={prevField()}
            />
          )}
          {field === 'instructions' && (
            <InstructionsEdit
              value={instructions}
              onSuccess={storeInstructions}
              next={nextField()}
              prev={prevField()}
            />
          )}
          {field === 'welcomeMessage' && (
            <WelcomeMessageEdit
              value={welcomeMessage}
              onSuccess={storeWelcomeMessage}
              next={nextField()}
              prev={prevField()}
            />
          )}
          {field === 'suggestedPrompts' && (
            <SuggestedPromptsEdit
              value={suggestedPrompts}
              onSuccess={storeSuggestedPrompts}
              next={nextField()}
              prev={prevField()}
            />
          )}
          {field === 'files' && (
            <FilesEdit
              files={files}
              new_files={newFiles}
              deleted_files={deletedFiles}
              onSuccess={storeFiles}
              next={nextField()}
              prev={prevField()}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default Agent;