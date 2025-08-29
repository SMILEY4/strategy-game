import {BaseProps} from "../base/base";
import {ReactElement} from "react";
import {joinClassNames} from "../window/utils";
import "./modalWindow.scoped.less";

export interface ModalWindowProps extends BaseProps {
    children?: any,
}

export function ModalWindow(props: ModalWindowProps): ReactElement {
    return (
        <div
            className={joinClassNames([
                "modal-window",
                ...BaseProps.buildBaseClassNames(props),
            ])}
            style={props.style}
        >
            {props.children}
        </div>
    );
}