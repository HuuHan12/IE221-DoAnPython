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

            {/* Dashboard Routes (Prefix /dashboard/) */}
            <Route path="/dashboard" element={<Statistics />} />
            <Route path="/dashboard/scan" element={<Home />} />
            <Route path="/dashboard/history" element={<HistoryPage />} />
            <Route path="/dashboard/lich-su" element={<HistoryPage />} />
            <Route path="/dashboard/gallery" element={<Gallery />} />
            <Route path="/dashboard/kho-anh" element={<Gallery />} />
            <Route path="/dashboard/favorites" element={<Favorites />} />
            <Route path="/dashboard/yeu-thich" element={<Favorites />} />
            <Route path="/dashboard/statistics" element={<Statistics />} />
            <Route path="/dashboard/profile" element={<Profile />} />

            {/* Backwards Compatibility Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/history" element={<HistoryPage />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;