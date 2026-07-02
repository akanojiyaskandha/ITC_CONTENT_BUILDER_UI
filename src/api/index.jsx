import { toast } from "@/hooks/use-toast";
import { navigateTo } from "@/navigation/navigation";
import { clearTokens } from "@/utils/auth/authService";
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Load env flag
const USE_AUTH = import.meta.env.VITE_USE_AUTH === "true";

apiClient.interceptors.request.use(
  (config) => {
    if (USE_AUTH) {
      const token = sessionStorage.getItem("accessToken");
      // console.log("API Token:", token);
      if (token) {
        config.headers.token = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized");
      toast({
        title: "Unauthorized",
        description:
          error.response?.data?.message ||
          "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      //    clearTokens();
      // window.location.href = '/';
      setTimeout(() => {
        clearTokens();
        navigateTo("/login"); 
        // window.location.href = "/";
      }, 1000);
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
