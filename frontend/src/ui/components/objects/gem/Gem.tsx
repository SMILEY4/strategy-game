import {MouseEvent, ReactElement} from "react";
import "./gem.css";
import "../../variables.css";
import {joinClassNames} from "../../utils";

export interface GemProps {
    interactive?: boolean;
    disabled?: boolean;
    round?: boolean;
    className?: string;
    classNameContent?: string;
    onClick?: (e: MouseEvent) => void;
    children?: any;
}

export function Gem(props: GemProps): ReactElement {
    return (
        <div
            className={joinClassNames([
                "gem",
                "gem__outer",
                props.disabled ? "gem--disabled" : null,
                props.interactive && props.disabled !== true ? "gem--interactive" : null,
                props.round ? "gem--round" : null,
                props.className,
            ])}
            onClick={props.onClick}
        >
            <div className="gem__highlight">
                <div className={joinClassNames(["gem__inner", props.classNameContent])}>
                    {props.children}
                </div>
            </div>
            <div className="gem__background"/>
        </div>
    );
}