import api from "../api/axios";

// CREATE RECIPE
export const createRecipe = async (data) => {
    const res = await api.post("/api/recipes", data);
    return res.data;
};

// GET ALL RECIPES
export const getRecipes = async () => {
    const res = await api.get("/api/recipes");
    return res.data;
};

// GET RECIPE BY ID
export const getRecipeById = async (id) => {
    const res = await api.get(`/api/recipes/${id}`);
    return res.data;
};

// UPDATE RECIPE
export const updateRecipe = async (id, data) => {
    const res = await api.put(`/api/recipes/${id}`, data);
    return res.data;
};

// DELETE RECIPE
export const deleteRecipe = async (id) => {
    const res = await api.delete(`/api/recipes/${id}`);
    return res.data;
};