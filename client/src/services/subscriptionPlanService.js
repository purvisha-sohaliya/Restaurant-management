import api from "../api/axios";

export const activateSubscription = async (data) => {
    const res = await api.post("/api/subscription-plans/activate", data);
    return res.data;
};

export const getSubscriptionPlans = async () => {
    const res = await api.get("/api/subscription-plans");
    return res.data;
};

export const createSubscriptionPlan = async (planData) => {
    const res = await api.post("/api/subscription-plans", planData);
    return res.data;
};

export const updateSubscriptionPlan = async (id, data) => {
    const res = await api.put(`/api/subscription-plans/${id}`, data);
    return res.data;
};

export const deleteSubscriptionPlan = async (id) => {
    const res = await api.delete(`/api/subscription-plans/${id}`);
    return res.data;
};

export const changeSubscriptionPlanStatus = async (id, status) => {
    const res = await api.patch(`/api/subscription-plans/${id}/status`, { status });
    return res.data;
};

export const getSubscriptionStatus = async () => {
    const res = await api.get("/api/subscription-plans/status");
    return res.data;
};