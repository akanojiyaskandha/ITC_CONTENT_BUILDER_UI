import axios from "axios";

const newBackend = axios.create({
  baseURL: import.meta.env.VITE_AIRFILE_API_URL,
});

newBackend.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err.response?.data ?? err)
);

export default newBackend;
