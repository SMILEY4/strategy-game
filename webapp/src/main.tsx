// import {createBrowserRouter, RouterProvider} from "react-router";
// import {createRoot} from "react-dom/client";
// import {routing} from "@pages/routing.tsx";
// import "@app/i18n/i18n.ts";
import "./main.less";
//
// export const router = createBrowserRouter(routing);
//
// createRoot(document.getElementById("root") || document.createElement("div")).render(
//     <RouterProvider router={router}/>,
// );


import {createRoot} from "react-dom/client";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import { Icon } from "./modules/uicomponents/icon/Icon";

createRoot(document.getElementById("root") || document.createElement("div")).render(
    <VerticalLayout center fillWidth fillHeight style={{height: "80vh"}}>


        <HorizontalLayout spacing3xl horizontalStart verticalCenter>

            <VerticalLayout spacingS verticalStart horizontalCenter>
                <Button size="s">Click Me!</Button>
                <Button size="m">Click Me!</Button>
                <Button size="l">Click Me!</Button>
            </VerticalLayout>

            <VerticalLayout spacingS verticalStart horizontalCenter>
                <Button shape="box">Click Me!</Button>
                <Button shape="pill">Click Me!</Button>
                <Button shape="square"><Icon.Cross/></Button>
                <Button shape="circle"><Icon.Cross/></Button>
            </VerticalLayout>

            <VerticalLayout spacingS verticalStart horizontalCenter>
                <Button disabled={false}>Enabled</Button>
                <Button disabled={true}>Disabled</Button>
            </VerticalLayout>

            <VerticalLayout spacingS verticalStart horizontalCenter>
                <Button intent="neutral">Neutral</Button>
                <Button intent="success">Success</Button>
                <Button intent="danger">Danger</Button>
            </VerticalLayout>

            <VerticalLayout spacingS verticalStart horizontalCenter>
                <Button size="s">Settings<Icon.Gear/></Button>
                <Button size="m">Settings<Icon.Gear/></Button>
                <Button size="l">Settings<Icon.Gear/></Button>
            </VerticalLayout>

        </HorizontalLayout>


    </VerticalLayout>
);