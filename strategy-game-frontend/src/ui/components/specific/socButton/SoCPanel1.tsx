import {ReactElement} from "react";
import "./socPanel1.css";

export function SoCPanel1(props: { children: any }): ReactElement {

    return (
        <div className="soc-panel1">
            <div className="soc-panel1__background"/>
            <div className="soc-panel1__border"/>
            {props.children}
        </div>
    );

}