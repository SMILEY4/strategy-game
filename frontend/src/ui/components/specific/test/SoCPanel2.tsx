import {ReactElement} from "react";
import "./socPanel2.css";

export function SoCPanel2(props: { children: any }): ReactElement {

    return (
        <div className="soc-panel2">
            <div className="soc-panel2__border"/>
            <div className="soc-panel2__background"/>
            <div className="soc-panel2__content">
                {props.children}
            </div>
        </div>
    );

}