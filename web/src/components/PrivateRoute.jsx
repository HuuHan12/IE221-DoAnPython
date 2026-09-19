import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Route Guard bảo vệ các trang yêu cầu đăng nhập.
 * Nếu chưa có access_token, điều hướng về trang /login kèm vị trí trước đó.
 */
function PrivateRoute({ children }) {
    const location = useLocation();
    const token = localStorage.getItem("access_token");

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default PrivateRoute;
