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


export const DISTRIBUTOR = new Distributor();


export function TODO(): any {
    throw new Error("Reacted a todo-statement")
}