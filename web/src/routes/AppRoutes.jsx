import React from "react";
import { Routes, Route } from "react-router-dom";
import ClientHome from "../pages/client/ClientHome";
import ClientLandmarks from "../pages/client/ClientLandmarks";
import ClientPricing from "../pages/client/ClientPricing";
import ClientAbout from "../pages/client/ClientAbout";
import ClientContact from "../pages/client/ClientContact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Statistics from "../pages/Statistics";
import Gallery from "../pages/Gallery";
import Favorites from "../pages/Favorites";
import HistoryPage from "../pages/HistoryPage";
import NotFound from "../pages/NotFound";

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<ClientHome />} />
            <Route path="/dia-danh" element={<ClientLandmarks />} />
            <Route path="/bang-gia" element={<ClientPricing />} />
            <Route path="/ve-du-an" element={<ClientAbout />} />
            <Route path="/lien-he" element={<ClientContact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/dashboard/scan" element={<Home />} />
            <Route path="/dashboard/history" element={<HistoryPage />} />
            <Route path="/dashboard/gallery" element={<Gallery />} />
            <Route path="/dashboard/favorites" element={<Favorites />} />
            <Route path="/dashboard/statistics" element={<Statistics />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;
