// import React from "react";
// import ReactDOM from "react-dom/client";
// import {App} from "./ui/pages/App";
//
// ReactDOM.createRoot(document.getElementById("root")!).render(<App/>);
// !! Strict-Mode tells react to re-render components twice (calls useEffect 2x) in dev-mode !!
// ==> Problems with canvas/rendering
// ==> https://reactjs.org/docs/strict-mode.html


import {DBTest} from "./shared/db/dbTest";

DBTest.benchmark();

