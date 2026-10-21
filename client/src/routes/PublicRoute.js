import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (user) {
        const from = location.state?.from;

        return (
            <Navigate
                to={from?.pathname || "/dashboard"}
                state={from?.state}
                replace
            />
        );
    }

    return <Outlet />;
}

export default PublicRoute;