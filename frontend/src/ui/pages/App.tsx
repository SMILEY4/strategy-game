import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import React from "react";
import "./app.css";
import {PageSignUp} from "./signup/PageSignUp";
import {PageSignupConfirm} from "./signupconfirm/PageSignupConfirm";
import {PageLogin} from "./login/PageLogin";
import {PageNotFound} from "./notfound/PageNotFound";
import {RequireAuth} from "../components/headless/RequireAuth";
import {PageSessions} from "./sessions/PageSessions";
import {PageInGame} from "./ingame/PageInGame";


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
					// <RequireAuth loginUrl="/login">
					    <PageInGame/>
					// </RequireAuth>
				}/>
				<Route path="*" element={<PageNotFound/>}/>
			</Routes>
		</BrowserRouter>
	);
}
