import axios from 'axios';

const API_URL = 'http://localhost:5000/api/members';

export const getMembers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getFamilyTree = async () => {
  const response = await axios.get(`${API_URL}/tree`);
  return response.data;
};

export const getMemberDetails = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createMember = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateMember = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteMember = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
