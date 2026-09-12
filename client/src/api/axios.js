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

        console.log("AXIOS ERROR:", {
            url: originalRequest?.url,
            status,
            message,
        });

        if (
            originalRequest?.url?.includes("/api/users/login") ||
            originalRequest?.url?.includes("/api/users/logout") ||
            originalRequest?.url?.includes("/api/users/refresh-access-token")
        ) {
            return Promise.reject(error);
        }
        if (
            status === 401 &&
            (
                message === "Access token expired" ||
                message === "Unauthorized"
            ) &&
            !originalRequest?._retry
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve,
                        reject,
                    });
                }).then(() => {
                    return api(originalRequest);
                });
            }

            isRefreshing = true;

            try {
                console.log("REFRESHING ACCESS TOKEN...");

                const refreshResponse = await api.post(
                    "/api/users/refresh-access-token",
                    {}
                );

                console.log(
                    "ACCESS TOKEN GENERATED:",
                    refreshResponse.data?.accessToken
                );

                processQueue(null);
                console.log("RETRYING ORIGINAL REQUEST:", originalRequest.url);
                return api(originalRequest);
            } catch (refreshError) {
                console.log(
                    "TOKEN REFRESH FAILED:",
                    refreshError.response?.data ||
                    refreshError.message
                );
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