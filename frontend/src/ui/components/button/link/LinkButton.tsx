import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./linkButton.scoped.less"
import {useButton, UseButtonProps} from "../../headless/useButton";

export interface LinkButtonProps extends UseButtonProps{
    fillParent?: boolean,
    align?: "left" | "center" | "right"
    className?: string,
    children?: any;
}

export function LinkButton(props: LinkButtonProps): ReactElement {
    const {elementProps, isDisabled} = useButton(props)
    return (
        <p
            {...elementProps}
            className={joinClassNames([
                "link-button",
                props.fillParent ? "link-button--fill-parent" : null,
                "link-button--" + (props.align || "left"),
                props.className,
            ])}
        >
            {props.children}
        </p>
    );
}
