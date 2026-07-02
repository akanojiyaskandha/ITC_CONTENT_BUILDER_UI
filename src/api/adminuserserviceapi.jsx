import apiClient from "./index";

export const userService = {
  login: (payload) => apiClient.post("/api/v1/auth/login", payload),
};
