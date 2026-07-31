import {type ReactElement, type ReactNode, useCallback} from "react";
import classNames from "classnames";
import styles from "./tabbar.module.less";
import {useTabbarContext} from "@modules/uicomponents/tabbar/Tabbar.Context.tsx";
import {gameAudio} from "@app/audio/gameAudio.ts";

export type Tabbar_TabProps = {
    value: string;
    children?: ReactNode;
    className?: string;
}

export function Tabbar_Tab(props: Tabbar_TabProps): ReactElement {

    const {value, children, className} = props;
    const {selectedTab, onSelectTab, registerTab} = useTabbarContext();

    const isActive = selectedTab === value;

    const refCallback = useCallback(
        (element: HTMLSpanElement | null) => {
            registerTab(value, element);
        },
        [value, registerTab],
    );

    return (
        <span
            ref={refCallback}
            className={classNames(styles.tab, className)}
            data-active={isActive || undefined}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => {
                gameAudio.CLICK_PRIMARY.play();
                onSelectTab(value)
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectTab(value);
                }
            }}
        >
            {children}
        </span>
    );
}
