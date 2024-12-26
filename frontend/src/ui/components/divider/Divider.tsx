import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./divider.scoped.less";

export interface DividerProps {
    type?: "ornament" | "simple";
    className?: string;
}

export function Divider(props: DividerProps): ReactElement {
    if (props.type === "simple") {
        return (
            <div className={joinClassNames(["divider", "divider--simple", props.className])}/>
        );
    } else {
        return (
            <div className={joinClassNames(["divider", "divider--ornament", props.className])}>
                <div className="divider__arm-left"/>
                <div className="divider__center"/>
                <div className="divider__arm-right"/>
            </div>
        );
    }

}