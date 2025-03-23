import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

export const getAllUsers = async () => {
  const res = await axios.get(`${API}/admin-dashboard`);
  return res.data;
};
