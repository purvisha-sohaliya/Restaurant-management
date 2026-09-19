import api from "../api/axios";

// Create Inventory
export const createInventory = async (data) => {
  const res = await api.post("/api/inventory", data);
  return res.data;
};

// Get All Inventory
export const getInventory = async () => {
  const res = await api.get("/api/inventory");
  return res.data;
};

// Get Inventory By ID
export const getInventoryById = async (id) => {
  const res = await api.get(`/api/inventory/${id}`);
  return res.data;
};

// Update Inventory
export const updateInventory = async (id, data) => {
  const res = await api.put(`/api/inventory/${id}`, data);
  return res.data;
};

// Add Stock
export const addStock = async (id, quantity) => {
  const res = await api.patch(`/api/inventory/${id}/add-stock`, {
    quantity,
  });
  return res.data;
};

// Get Low Stock
export const getLowStock = async () => {
  const res = await api.get("/api/inventory/low-stock");
  return res.data;
};

// Delete Inventory
export const deleteInventory = async (id) => {
  const res = await api.delete(`/api/inventory/${id}`);
  return res.data;
};