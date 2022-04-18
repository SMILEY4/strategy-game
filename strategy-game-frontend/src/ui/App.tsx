import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {PageHome} from "./pages/home/PageHome";
import {PageGame} from "./pages/game/PageGame";
import {PageNotFound} from "./pages/notfound/PageNotFound";

export function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="home" replace/>}/>
				<Route path="home" element={<PageHome/>}/>
				<Route path="game" element={<PageGame/>}/>
				<Route path="*" element={<PageNotFound/>}/>
			</Routes>
		</BrowserRouter>
	);
}
