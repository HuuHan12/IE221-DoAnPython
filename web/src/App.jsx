import { Routes, Route } from "react-router-dom";

import Navbar from "../src/components/Navbar";

import Home from "../src/pages/Home";
// import About from "../src/pages/About";
import Login from "../src/pages/Login";
import Register from "../src/pages/Register";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                {/* <Route path="/about" element={<About />} /> */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;