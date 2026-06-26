import {createBrowserRouter, RouterProvider} from "react-router";
import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {routing} from "@pages/routing.tsx";
import "@app/i18n/i18n.ts"
import "./main.less"

export const router = createBrowserRouter(routing);

createRoot(document.getElementById("root") || document.createElement("div")).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>,
);