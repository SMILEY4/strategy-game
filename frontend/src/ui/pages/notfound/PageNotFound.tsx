import React, {ReactElement} from "react";
import "./pageNotFound.css";
import {PanelDecorated} from "../../components/objects/panels/decorated/PanelDecorated";
import {PanelCloth} from "../../components/objects/panels/cloth/PanelCloth";


export function PageNotFound(): ReactElement {
    return (
        <PanelCloth className="page-404" color="blue">
            <PanelDecorated classNameContent="page-404__content">
                <h1>404</h1>
                <p>The requested page does not exist</p>
            </PanelDecorated>
        </PanelCloth>
    );
}