import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {PageHome} from "./pages/home/PageHome";
import {PageGame} from "./pages/game/PageGame";
import {PageNotFound} from "./pages/notfound/PageNotFound";
import {PageLogin} from "./pages/login/PageLogin";
import {RequireAuth} from "./components/RequireAuth";
import {PageSignUp} from "./pages/signup/PageSignUp";

export function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="home" replace/>}/>
				<Route path="login" element={<PageLogin/>}/>
				<Route path="signup" element={<PageSignUp/>}/>
				<Route path="home" element={
					<RequireAuth loginUrl="/login">
						<PageHome/>
					</RequireAuth>
				}/>
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
