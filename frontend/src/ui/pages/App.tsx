import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import React from "react";
import {PageNotFound} from "./notfound/PageNotFound";
import {PageLogin} from "./login/PageLogin";
import {PageSignUp} from "./signup/PageSignUp";
import {PageSignupConfirm} from "./signupconfirm/PageSignupConfirm";
import {RequireAuth} from "../components/misc/RequireAuth";
import {PageSessions} from "./sessions/pageSessions";
import {PageInGame} from "./ingame/PageInGame";
import "./app.css";


export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="sessions" replace/>}/>
                <Route path="login" element={<PageLogin/>}/>
                <Route path="signup" element={<PageSignUp/>}/>
                <Route path="signup/confirm" element={<PageSignupConfirm/>}/>
                <Route path="sessions" element={
                    <RequireAuth loginUrl="/login">
                        <PageSessions/>
                    </RequireAuth>
                }/>
                <Route path="game" element={
                    <RequireAuth loginUrl="/login">
                        <PageInGame/>
                    </RequireAuth>
                }/>
                <Route path="*" element={<PageNotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
}
