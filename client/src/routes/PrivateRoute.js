import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AUTH_ROUTE } from "../Constant/RoutesConstant";

function PrivateRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (!user) {
        return <Navigate to={AUTH_ROUTE.LOGIN} />;
    }

    return <Outlet />;
}

export default PrivateRoute;