import {ReactElement} from "react";
import "./section.css";

export function Section(props: { title: string, children: any }): ReactElement {
    return (
        <div className="section">
            <div className="header">
                {props.title}
            </div>
            <div className="body">
                {props.children}
            </div>
        </div>
    );
}