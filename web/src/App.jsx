import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "../src/components/Navbar";

import Home from "../src/pages/Home";
import Login from "../src/pages/Login";
import Register from "../src/pages/Register";
import Profile from "../src/pages/Profile";
import Statistics from "../src/pages/Statistics";
import Gallery from "../src/pages/Gallery";
import NotFound from "./pages/NotFound";

function App() {
    const location = useLocation();
    const isDashboardLayout =
        location.pathname === "/profile" ||
        location.pathname === "/statistics" ||
        location.pathname === "/gallery" ||
        location.pathname === "/kho-anh";

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
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;