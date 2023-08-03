import React, {ReactElement} from "react";
import {BgPanel} from "../../components/backgroundpanel/BgPanel";
import {DecoratedPanel} from "../../components/decoratedpanel/DecoratedPanel";
import "./pageNotFound.css";


export function PageNotFound(): ReactElement {
    return (
        <BgPanel className="page-404" type="blue">
            <DecoratedPanel className="page-404__content">
                <h1>404</h1>
                <p>The requested page does not exist</p>
            </DecoratedPanel>
        </BgPanel>
    );
}