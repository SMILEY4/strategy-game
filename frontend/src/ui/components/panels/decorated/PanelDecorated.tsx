import {ReactElement} from "react";
import "./panelDecorated.css";
import {joinClassNames} from "../../utils";


export interface PanelDecoratedProps {
    children?: any;
    className?: string;
}

export function PanelDecorated(props: PanelDecoratedProps): ReactElement {

    return (
        <div className={joinClassNames(["decorated-panel", props.className])}>
            <div className="decorated-panel__background"/>
            <div className="decorated-panel__border"/>
            {props.children}
        </div>
    );

}