import {ReactElement} from "react";
import "./gemElement.css";
import {joinClassNames} from "../utils";

export interface GemElementProps {
    className?: string,
    children?: any;
    interactive?: boolean,
    onClick?: () => void
}

export function GemElement(props: GemElementProps): ReactElement {
    return (
        <div
            className={joinClassNames(["gem-element", classInteractive(props), props.className])}
            onClick={props.onClick}
        >
            <div className={"gem-element__outer"}>
                <div className={"gem-element__inner"}>
                    {props.children}
                </div>
            </div>
            <div className="gem-element__background"/>
        </div>
    );

    function classInteractive(props: GemElementProps): string | null {
        return props.interactive ? "gem-element--interactive" : null;
    }

}