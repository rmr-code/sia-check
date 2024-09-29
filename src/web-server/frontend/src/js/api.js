// api.js
import axios from 'axios';

// The X-Requested-With header
const X_REQUEST_STR = 'XteNATqxnbBkPa6TCHcK0NTxOM1JVkQl'
// Create BaseURL
// uncomment below for development
const baseUrl = 'http:/localhost:8080';
// uncomment below for production
//const baseUrl = window.location.origin;


// Base Axios instance with global settings
const api = axios.create({
  baseURL: 'http:/localhost:8080/api/',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'X-Requested-With': X_REQUEST_STR,
  },
});

// Standard Error handler
const handleAxiosError = (error) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with an error status
      const errorMessage = error.response.data.detail || 'An error occurred on the server';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('No response received from the server. Please try again later.');
    }
  } else if (error instanceof Error) {
    throw new Error(error.message);
  } else {
    throw new Error('An unexpected error occurred');
  }
};

// check if admin password set
export const checkAdminPasswordStatus = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/auth/is-admin-password-set',
      {
        withCredentials: true,
        headers: { 'X-Requested-With': X_REQUEST_STR },
      }
    );
    return response.data;
  }
  catch (e) {
    handleAxiosError(e);
  }
};

// check if admin password set
export const checkToken = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/auth/check-token', {
      withCredentials: true,
      headers: { 'X-Requested-With': X_REQUEST_STR },
    });
    return response.data;
  }
  catch (e) {
    handleAxiosError(e);
  }
};

// set Admin password
export const setAdminPassword = async (password) => {
  const data = {
    "password": password
  }
  try {
    const response = await axios.post('http://localhost:8080/api/auth/set-admin-password',
      data,
      {
        headers: { 'X-Requested-With': X_REQUEST_STR },
      });
    return response.data;
  }
  catch (e) {
    handleAxiosError(e);
  }
}

// login
export const login = async (password) => {
  const data = {
    "username": "admin",
    "password": password
  }
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login',
      data,
      {
        withCredentials: true,
        headers: { 'X-Requested-With': X_REQUEST_STR },
      });
    return response.data;
  }
  catch (e) {
    handleAxiosError(e);
  }
}

// Change Admin password
export const changeAdminPassword = async (currentPassword, newPassword) => {
  const data = {
    "current_password": currentPassword,
    "new_password": newPassword,
  }
  try {
    const response = await axios.post('http://localhost:8080/api/auth/change-admin-password',
      data,
      {
        withCredentials: true,
        headers: { 'X-Requested-With': X_REQUEST_STR },
      });
    return response.data;
  }
  catch (e) {
    handleAxiosError(e);
  }
}


// set Admin password
export const logout = async (password) => {
  const data = {}
  try {
    const response = await axios.post('http://localhost:8080/api/auth/logout',
      data,
      {
        withCredentials: true,
        headers: { 'X-Requested-With': X_REQUEST_STR },
      });
    return response.data;
  }
  catch (e) {
    handleAxiosError(e);
  }
}

// get all agents
export const getAgents = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/agents',
      {
        withCredentials: true,
        headers: { 'X-Requested-With': X_REQUEST_STR },
      });
    return response.data;
  }
  catch (e) {
    handleAxiosError(e);
  }
}

// get agent by name
export const getAgent = async (agentname) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/agents/${agentname}`,
      {
        withCredentials: true,
        headers: { 'X-Requested-With': X_REQUEST_STR },
      });
    return response.data;
  }
  catch (e) {
    handleAxiosError(e);
  }
}

// save agent by name
export const saveAgent = async (agentname, formData) => {
  try {
    if (agentname) {
      console.log('this is put')
      const response = await axios.put(`http://localhost:8080/api/agents/${agentname}`,
        formData,
        {
          withCredentials: true,
          headers: { 'X-Requested-With': X_REQUEST_STR },
        });
      return response.data;
    }
    else {
      console.log('this is post')
      const response = await axios.post(`http://localhost:8080/api/agents/`,
        formData,
        {
          withCredentials: true,
          headers: { 'X-Requested-With': X_REQUEST_STR },
        });
      return response.data;

    }
  }
  catch (e) {
    handleAxiosError(e);
  }
}

// get agent for chat which is a subset of normal get agent
export const getAgentForChat = async (agentname) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/chat/${agentname}`,
      {
        withCredentials: true,
        headers: { 'X-Requested-With': X_REQUEST_STR },
      });
    return response.data;
  }
  catch (e) {
    handleAxiosError(e);
  }
}

// submit chat prompt to llm
export const submitChatPrompt = async (agentname, data) => {
  try {
    const response = await axios.post(`http://localhost:8080/api/chat/${agentname}`,
      data,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain;charset=utf-8',
          'X-Requested-With': X_REQUEST_STR
        },
      });
    return response.data;
  }
  catch (e) {
    handleAxiosError(e);
  }
}
