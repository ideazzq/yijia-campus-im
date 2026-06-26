import React, {useEffect} from "react";
import {Route, Routes} from "react-router-dom";
import Homepage from "./components/Homepage";
import SignIn from "./components/register/SignIn";
import SignUp from "./components/register/SignUp";
import LandingPage from "./components/landing/LandingPage";
import AdminSignIn from "./components/admin/AdminSignIn";
import AdminDashboard from "./components/admin/AdminDashboard";

function App() {
    useEffect(() => {
        document.title = "翼家校园通信系统";
    }, []);

    return (
        <div>
            <Routes>
                <Route path="/" element={<LandingPage/>}/>
                <Route path="/app" element={<Homepage/>}/>
                <Route path="/signin" element={<SignIn/>}/>
                <Route path="/signup" element={<SignUp/>}/>
                <Route path="/admin/signin" element={<AdminSignIn/>}/>
                <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
            </Routes>
        </div>
    );
}

export default App;
