import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./simpleDivider.scoped.less";

export interface SimpleDividerProps {
    className?: string;
}

export function SimpleDivider(props: SimpleDividerProps): ReactElement {
    return (
        <div className={joinClassNames(["divider-simple", props.className])}/>
    );

}