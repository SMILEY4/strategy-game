import {ReactElement} from "react";
import {joinClassNames} from "../window/utils";
import "./divider.scoped.less";
import {BaseProps} from "../base/base";

export interface DividerProps extends BaseProps {
    type?: "ornament" | "line";
    ornament?: boolean;
    line?: boolean,
}

export function Divider(props: DividerProps): ReactElement {
    const type = getType();

    if (type === "line") {
        return (
            <div
                className={joinClassNames([
                    "divider",
                    "divider--line",
                    ...BaseProps.buildBaseClassNames(props),
                ])}
                style={props.style}
            />
        );
    }

    if (type === "ornament") {
        return (
            <div
                className={joinClassNames([
                    "divider",
                    "divider--ornament",
                    ...BaseProps.buildBaseClassNames(props)
                ])}
                style={props.style}
            >
                <div className="divider__arm-left"/>
                <div className="divider__center"/>
                <div className="divider__arm-right"/>
            </div>
        );
    }

    return <></>;

    function getType(): "ornament" | "line" {
        if (props.type) return props.type;
        if (props.line) return "line";
        if (props.ornament) return "ornament";
        return "line";
    }
}