import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import Gallery from "./pages/Gallery";
import Favorites from "./pages/Favorites";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";

function App() {
    const location = useLocation();
    const isDashboardLayout =
        location.pathname === "/profile" ||
        location.pathname === "/statistics" ||
        location.pathname === "/gallery" ||
        location.pathname === "/kho-anh" ||
        location.pathname === "/favorites" ||
        location.pathname === "/yeu-thich" ||
        location.pathname === "/history" ||
        location.pathname === "/lich-su";

    return (
        <>
            {!isDashboardLayout && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/kho-anh" element={<Gallery />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/yeu-thich" element={<Favorites />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/lich-su" element={<HistoryPage />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;