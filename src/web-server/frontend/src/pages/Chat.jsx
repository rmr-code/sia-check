// Chat.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import { HiArrowCircleUp } from 'react-icons/hi';
import { FaRegSnowflake, FaThermometerHalf, FaFire } from 'react-icons/fa';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ErrorBlock from '../components/ui/ErrorBlock';
import {getAgentForChat, submitChatPrompt} from '../js/api';

const Chat = () => {
  const { agentname } = useParams();
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  const [containerHeight, setContainerHeight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [agentData, setAgentData] = useState({
    name: '',
    welcome_message: 'Hello! How can I help you today?',
    suggested_prompts: ['', '', ''],
  });

  const [messages, setMessages] = useState([
    { id: uuidv4(),  content: agentData.welcome_message, role: 'system' },
  ]);
  const [input, setInput] = useState('');

  // New state variables for temperature and response length
  const [temperature, setTemperature] = useState(2); // 1: Low, 2: Medium, 3: High
  const [responseLength, setResponseLength] = useState(2); // 1: Short, 2: Medium, 3: Long

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage = { id: uuidv4(), content: input, role: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      setLoading(true);

      const data = {
        input: input,
        messages: messages,
        temperature: temperature,
        response_length: responseLength,
      };

      try {
        const responsedata = await submitChatPrompt(agentname, data);
        const responseMessage = {
          id: uuidv4(), 
          content: responsedata.content.toString(),
          role: responsedata.role,
        };
        setMessages((prevMessages) => [...prevMessages, responseMessage]);
      } catch (err) {
        console.error(err);
        setError('Failed to send message.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSuggestedPrompt = (index) => {
    if (index >= 0 && index < agentData.suggested_prompts.length) {
      setInput(agentData.suggested_prompts[index]);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleResize = (entry) => {
      setContainerHeight(entry.contentRect.height);
      window.parent.postMessage(
        { type: 'iframeHeight', height: entry.contentRect.height },
        window.location.origin
      );
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        handleResize(entry);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    if (agentname) {
      fetchAgentData(agentname);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [agentname]);

  const string2array = (input) => {
    // Split the input string by commas and limit to 3 elements
    let result = input ? input.split(',').slice(0, 3) : [];
  
    // Fill the array with empty strings if it's less than 3 items
    while (result.length < 3) {
      result.push('');
    }
  
    return result;
  }

  const fetchAgentData = async (agentname) => {
    try {
      setLoading(true);
      setError(null);
      const responsedata = getAgentForChat(agentname);
      if (responsedata && responsedata.agent) {
        // get agent data
        const data = response.agent;
        if (data.welcome_message) {
          const welcomeMessage = {
            id: uuidv4(), 
            content: data.welcome_message,
            role: 'system',
          };
          setMessages([welcomeMessage]);
        }
        suggested_prompts_arr = string2array(data.suggested_prompts);
        setAgentData({
            name: data.name,
            welcome_message: data.welcome_message,
            suggested_prompts:  suggested_prompts_arr
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load agent data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-max p-4 w-full">
      {/* Suggested Prompts */}
      <div className="flex flex-row gap-4 w-full mb-4">
        {agentData.suggested_prompts.map((prompt, index) => (
          <div
            key={index}
            onClick={() => handleSuggestedPrompt(index)}
            className="flex-1 cursor-pointer rounded-lg bg-gray-100 text-xs font-thin text-gray-800 p-4 border border-gray-200"
          >
            {prompt}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((message) =>
          message.role === 'user' ? (
            <div
              key={message.id}
              className="my-2 p-2 rounded-lg bg-gray-100 text-gray-800 self-end text-right max-w-[70%] ml-auto"
            >
              {message.content}
            </div>
          ) : (
            <div
              key={message.id}
              className="my-2 p-2 rounded-lg text-black self-start max-w-full mr-auto"
            >
              {message.content}
            </div>
          )
        )}
      </div>

      {/* Input Area */}
      {!loading && !error && (
        <div className="flex items-center rounded-full bg-gray-100 px-4 py-2">

          {/* Response Length Selector */}
          <div className="flex items-center space-x-1 mr-2">
            <button
              className={`focus:outline-none ${
                responseLength === 1 ? 'text-green-500' : 'text-gray-400'
              }`}
              onClick={() => setResponseLength(1)}
              aria-label="Short Response"
            >
              <span className="text-sm">S</span>
            </button>
            <button
              className={`focus:outline-none ${
                responseLength === 2 ? 'text-green-500' : 'text-gray-400'
              }`}
              onClick={() => setResponseLength(2)}
              aria-label="Medium Response"
            >
              <span className="text-sm">M</span>
            </button>
            <button
              className={`focus:outline-none ${
                responseLength === 3 ? 'text-green-500' : 'text-gray-400'
              }`}
              onClick={() => setResponseLength(3)}
              aria-label="Long Response"
            >
              <span className="text-sm">L</span>
            </button>
          </div>

          {/* Text Input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message your smart agent"
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none overflow-hidden"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          {/* Send Button */}
          <button
            ref={buttonRef}
            className="cursor-pointer"
            onClick={handleSendMessage}
            aria-label="Send Message"
          >
            <HiArrowCircleUp className="text-3xl" />
          </button>
        </div>
      )}

      {/* Error and Loading Messages */}
      {error && <ErrorBlock>{error}</ErrorBlock>}
      {loading && !error && (
        <div className="px-2 font-thin text-xs md:text-sm lg:text-md text-gray-800">
          Agent is working on your request...
        </div>
      )}
    </div>
  );
};

export default Chat;
