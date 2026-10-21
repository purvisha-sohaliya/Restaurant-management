import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AUTH_ROUTE } from "../Constant/RoutesConstant";

function PrivateRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (!user) {
        return (
            <Navigate
                to={AUTH_ROUTE.LOGIN}
                state={{ from: location }}
                replace
            />
        );
    }

    return <Outlet />;
}

export default PrivateRoute;