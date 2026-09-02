
// import api from "../api/axios";

// export const login = async (data) => {
//     const res = await api.post("/api/users/login", data);
//     return res.data;
// };

// export const getProfile = async () =>{
//     const res = await api.get("/api/users/profile");
//     return res.data;
// }


// export const refreshAccessToken = async () =>{
//     const res = await api.post("/api/users/refresh-access-token");
//     return res.data;
// }

// export const logout = async () =>{
//     const res = await api.post("/api/users/logout");
//     return res.data;
// }




import api from "../api/axios";

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

