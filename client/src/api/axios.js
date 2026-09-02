import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve();
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (
            status === 401 &&
            message === "Access token expired" &&
            !originalRequest?._retry &&
            !originalRequest?.url?.includes("/api/users/login") &&
            !originalRequest?.url?.includes("/api/users/refresh-access-token")
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }

            isRefreshing = true;

            try {
                await api.post(
                    "/api/users/refresh-access-token",
                    {}
                );

                processQueue(null);

                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError);
                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;