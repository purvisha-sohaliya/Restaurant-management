import api from "../api/axios";

export const generateBill = async (data) => {
  const response = await api.post("/api/bills", data);
  return response.data;
};

export const confirmPayment = async (id, data) => {
  const response = await api.patch(`/api/bills/${id}/pay`, data);
  return response.data;
};

export const getBills = async (params) => {
  const response = await api.get("/api/bills", {
    params,
  });
  return response.data;
};

export const getBillById = async (id) => {
  const response = await api.get(`/api/bills/${id}`);
  return response.data;
};

export const getKOT = async (orderId) => {
  const response = await api.get(`/api/bills/kot/${orderId}`);
  return response.data;
};