import {ReactElement} from "react";
import {MetalBorder} from "../objects/metalborder/MetalBorder";
import {Inset} from "../objects/inset/Inset";
import "./../variables.css";
import "./tabPane.css";

export interface TabPaneProps {
    children?: any;
}

export function TabPane(props: TabPaneProps): ReactElement {
    return (
        <div className="tab-pane">
            <div className="tab-pane__header">

                <MetalBorder type={"silver"}>
                    <Inset>
                        Tab1
                    </Inset>
                </MetalBorder>


                <MetalBorder type={"silver"} className="tab--active">
                    <Inset>
                        Tab2
                    </Inset>
                </MetalBorder>

            </div>

            <MetalBorder type="silver" className="tab-pane__content">
                <Inset>

                    <div style={{
                        width: "200px",
                        height: "300px",
                    }}/>

                </Inset>
            </MetalBorder>

        </div>
    );
}