import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import React from "react";
import {PageNotFound} from "./pages/notfound/PageNotFound";
import {PageLogin} from "./pages/login/PageLogin";
import {PageSignUp} from "./pages/signup/PageSignUp";
import {PageSignupConfirm} from "./pages/signupconfirm/PageSignupConfirm";
import {RequireAuth} from "./components/misc/RequireAuth";
import {PageHome} from "../uiOLD/pages/home/PageHome";
import {PageGame} from "../uiOLD/pages/game/PageGame";
import "./app.css";
import {PageSessions} from "./pages/sessions/pageSessions";

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="home" replace/>}/>
                <Route path="login" element={<PageLogin/>}/>
                <Route path="signup" element={<PageSignUp/>}/>
                <Route path="signup/confirm" element={<PageSignupConfirm/>}/>

                <Route path="sessions" element={<PageSessions/>}/>

                {/*TEMP*/}
                <Route path="home" element={
                    <RequireAuth loginUrl="/login">
                        <PageHome/>
                    </RequireAuth>
                }/>
                {/*TEMP*/}
                <Route path="game" element={
                    <RequireAuth loginUrl="/login">
                        <PageGame/>
                    </RequireAuth>
                }/>

                <Route path="*" element={<PageNotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
}
