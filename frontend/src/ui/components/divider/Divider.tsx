import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./divider.scoped.less";

export interface DividerProps {
    className?: string;
}

export function Divider(props: DividerProps): ReactElement {
    return (
        <div className={joinClassNames(["divider", props.className])}>
            <div className="divider__arm-left"/>
            <div className="divider__center"/>
            <div className="divider__arm-right"/>
        </div>
    );

}