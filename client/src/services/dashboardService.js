import api from "../api/axios";

export const getDashboard = async () => {
    const res = await api.get("/api/dashboard");
    return res.data;
}

export const getMonthlyRevenue = async (year) => {
    const res = await api.get("/api/dashboard/revenue/monthly",
        {
            params: {
                year: year,
            },
        }
    );
    return res.data;
}

export const getDailyOrders = async () => {
    const response = await api.get("/api/dashboard/orders/daily");
    return response.data;
};

export const getMonthlyOrders = async () => {
    const response = await api.get("/api/dashboard/orders/monthly");
    return response.data;
};

export const getTopSellingItems = async () => {
    const response = await api.get("/api/dashboard/items/top-selling");
    return response.data;
}

export const getOrderTypeDistribution = async () => {
    const response = await api.get("/api/dashboard/orders/type-distribution");
    return response.data;
}