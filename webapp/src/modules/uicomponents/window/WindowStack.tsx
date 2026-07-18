import type {ReactElement} from "react";
import {useWindowStack} from "@modules/uicomponents/window/useWindowStack.ts";
import {WindowFrame} from "@modules/uicomponents/window/WindowFrame.tsx";
import styles from "./windowStack.module.less";
import classNames from "classnames";
import {WINDOW_STACK_ID} from "@modules/uicomponents/window/window-system.ts";

interface WindowStackProps {
    className?: string;
}

export function WindowStack(props: WindowStackProps): ReactElement {
    const {windowIds} = useWindowStack();
    return (
        <div className={classNames(styles["window-stack"], props.className)} id={WINDOW_STACK_ID}>
            {windowIds.map(id => <WindowFrame key={id} windowId={id}/>)}
        </div>
    );
}