
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <h1>Loading...</h1>;
    }

    // Already logged in → dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    // Not logged in → allow public pages
    return <Outlet />;
}

export default PublicRoute;

