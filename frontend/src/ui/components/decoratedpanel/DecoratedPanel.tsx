import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./decoratedPanel.css";


export interface DecoratedPanelProps {
    children?: any;
    className?: string;
}

export function DecoratedPanel(props: DecoratedPanelProps): ReactElement {

    return (
        <div className={joinClassNames(["decorated-panel", props.className])}>
            <div className="decorated-panel__background"/>
            <div className="decorated-panel__border"/>
            {props.children}
        </div>
    );

}