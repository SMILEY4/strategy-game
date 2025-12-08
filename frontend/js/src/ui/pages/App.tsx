import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import React from "react";
import "./app.css";
import {PageSignupConfirm} from "./signupconfirm/PageSignupConfirm";
import {LoginPage} from "./login/Login.page";
import {PageNotFound} from "./notfound/PageNotFound";
import {PageInGame} from "./ingame/PageInGame";
import {TextureAtlasEditor} from "../../tools/textureatlaseditor/TextureAtlasEditor";
import {RequireAuth} from "../../app/authentication/RequireAuth";
import {AuthProvider} from "../../app/authentication/AuthProvider";
import {PageGameSessions} from "./sessions/GameSessions.page";
import {PageSignUp} from "./signup/SignUp.page";


export function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="sessions" replace/>}/>
                    <Route path="login" element={<LoginPage/>}/>
                    <Route path="signup" element={<PageSignUp/>}/>
                    <Route path="signup/confirm" element={<PageSignupConfirm/>}/>
                    <Route path="sessions" element={
                        <RequireAuth loginUrl="/login">
                            <PageGameSessions/>
                        </RequireAuth>
                    }/>
                    <Route path="game" element={
                        // <RequireAuth loginUrl="/login">
                        <PageInGame/>
                        // </RequireAuth>
                    }/>
                    <Route path="tools">
                        <Route path="textureatlaseditor" element={<TextureAtlasEditor/>}/>
                    </Route>
                    <Route path="*" element={<PageNotFound/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
