import {joinClassNames} from "../../components/utils";
import "./inset.less";

export interface InsetProps {
    children?: any;
}

export function Inset(props: InsetProps) {
    return (
        <div className={joinClassNames([
            "inset",
        ])}>
            {props.children}
        </div>
    );
}