import React from "react";
import { Routes, Route } from "react-router-dom";
import "./css/Client.css";

// Client Pages
import ClientHome from "./pages/client/ClientHome";
import ClientLandmarks from "./pages/client/ClientLandmarks";
import ClientPricing from "./pages/client/ClientPricing";
import ClientAbout from "./pages/client/ClientAbout";
import ClientContact from "./pages/client/ClientContact";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Auth Guard
import PrivateRoute from "./components/PrivateRoute";

// Dashboard Pages
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import Gallery from "./pages/Gallery";
import Favorites from "./pages/Favorites";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <Routes>
            {/* Client Routes */}
            <Route path="/" element={<ClientHome />} />
            <Route path="/dia-danh" element={<ClientLandmarks />} />
            <Route path="/bang-gia" element={<ClientPricing />} />
            <Route path="/ve-du-an" element={<ClientAbout />} />
            <Route path="/lien-he" element={<ClientContact />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Scan Page (Cho phép cả khách vãng lai và người dùng đăng nhập) */}
            <Route path="/dashboard/scan" element={<Home />} />
            <Route path="/scan" element={<Home />} />

            {/* Dashboard Routes (Bảo vệ bằng PrivateRoute - yêu cầu đăng nhập) */}
            <Route path="/dashboard" element={<PrivateRoute><Statistics /></PrivateRoute>} />
            <Route path="/dashboard/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
            <Route path="/dashboard/lich-su" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
            <Route path="/dashboard/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
            <Route path="/dashboard/kho-anh" element={<PrivateRoute><Gallery /></PrivateRoute>} />
            <Route path="/dashboard/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
            <Route path="/dashboard/yeu-thich" element={<PrivateRoute><Favorites /></PrivateRoute>} />
            <Route path="/dashboard/statistics" element={<PrivateRoute><Statistics /></PrivateRoute>} />
            <Route path="/dashboard/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Backwards Compatibility Routes */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/statistics" element={<PrivateRoute><Statistics /></PrivateRoute>} />
            <Route path="/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
            <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;