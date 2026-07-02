import axios from "axios";

const isProd = import.meta.env.PROD;

// const baseURL = isProd
//   ? (import.meta.env.VITE_LTS_API_URL ?? "/api/v1")
//   : "/api/v1";

const baseURL=import.meta.env.VITE_LTS_API_URL
const ltsApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

ltsApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data ?? error)
);

export default ltsApi;
