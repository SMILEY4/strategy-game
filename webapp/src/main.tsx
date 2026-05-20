import {createRoot} from "react-dom/client";
import {StrictMode} from "react";
import {Canvas} from "@uicomponents/canvas/Canvas.tsx";
import "./main.less"

createRoot(document.getElementById("root") || document.createElement("div")).render(
    <StrictMode>
        <Canvas/>
    </StrictMode>,
);
