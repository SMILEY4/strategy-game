import React from "react";
import ReactDOM from "react-dom/client";
import {App} from "./ui/App";
import "./ui/index.css";
import {Distributor} from "./distributing/distributor";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
// !! Strict-Mode causes react to re-render components twice (calls useEffect 2x) in dev-mode !!
// ==> handle communication with logic outside of react-lifecycle with care (or move strict-mode to "page"-level)
// (https://reactjs.org/docs/strict-mode.html)


export const DISTRIBUTOR = new Distributor();


export function TODO(): any {
	throw new Error("Reached a todo-statement");
}