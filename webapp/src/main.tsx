import {createBrowserRouter, RouterProvider} from "react-router";
import {createRoot} from "react-dom/client";
import {routing} from "@pages/routing.tsx";
import "@app/i18n/i18n.ts";
import "./main.less";
import {greet} from "../wasm/pkg";

callWasm()

export const router = createBrowserRouter(routing);

createRoot(document.getElementById("root") || document.createElement("div")).render(
    <RouterProvider router={router}/>,
);



function callWasm() {
    greet()
}