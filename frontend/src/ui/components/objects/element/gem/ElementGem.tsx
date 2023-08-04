import {ReactElement} from "react";
import "./elementGem.css";
import {joinClassNames} from "../../../utils";

export interface ElementGemProps {
    className?: string,
    children?: any;
    interactive?: boolean,
    onClick?: () => void
}

export function ElementGem(props: ElementGemProps): ReactElement {
    return (
        <div
            className={joinClassNames(["element-gem", classInteractive(props), props.className])}
            onClick={props.onClick}
        >
            <div className={"element-gem__outer"}>
                <div className={"element-gem__inner"}>
                    {props.children}
                </div>
            </div>
            <div className="element-gem__background"/>
        </div>
    );

    function classInteractive(props: ElementGemProps): string | null {
        return props.interactive ? "element-gem--interactive" : null;
    }

}