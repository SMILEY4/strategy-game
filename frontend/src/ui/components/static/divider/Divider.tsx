import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./divider.scoped.less";

export interface DividerProps {
    className?: string;
}

export function Divider(props: DividerProps): ReactElement {
    return (
        <div className={joinClassNames(["divider", props.className])}/>
    );

}