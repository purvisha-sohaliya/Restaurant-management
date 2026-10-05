import api from "../api/axios";

export const register = async (data) => {
  const response = await api.post("/api/users/register", data);
  return response.data;
};

export const login = async (data) => {
  const response = await api.post("/api/users/login", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/api/users/profile");
  return response.data;
};

export const refreshAccessToken = async () => {
  const response = await api.post("/api/users/refresh-access-token", {});
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/api/users/logout", {});
  return response.data;
};