import {BrowserRouter, Route, Routes} from "react-router-dom";
import React from "react";
import {PageNotFound} from "./pages/notfound/PageNotFound";
import "./app.css";
import {PageLogin} from "./pages/login/PageLogin";
import {PageSignUp} from "./pages/signup/PageSignUp";

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="login" element={<PageLogin/>}/>
                <Route path="signup" element={<PageSignUp/>}/>
                <Route path="*" element={<PageNotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
}
