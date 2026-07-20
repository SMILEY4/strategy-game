import {type ReactElement, type ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState} from "react";
import classNames from "classnames";
import styles from "./tabbar.module.less";
import { TabbarContext } from "./Tabbar.Context";

export type Tabbar_RootProps = {
    selectedTab: string;
    onSelectTab: (value: string) => void;
    children?: ReactNode;
    className?: string;
}

export function Tabbar_Root(props: Tabbar_RootProps): ReactElement {

    const {selectedTab, onSelectTab, children, className} = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const tabElementsRef = useRef<Map<string, HTMLElement>>(new Map());
    const [indicator, setIndicator] = useState<{left: number; width: number}>({left: 0, width: 0});

    const registerTab = useCallback(
        (value: string, element: HTMLElement | null) => {
            if (element) {
                tabElementsRef.current.set(value, element);
            } else {
                tabElementsRef.current.delete(value);
            }
        },
        [],
    );

    useLayoutEffect(() => {
        const container = containerRef.current;
        const activeElement = tabElementsRef.current.get(selectedTab);
        if (container && activeElement) {
            const containerRect = container.getBoundingClientRect();
            const tabRect = activeElement.getBoundingClientRect();
            setIndicator({
                left: tabRect.left - containerRect.left,
                width: tabRect.width,
            });
        }
    }, [selectedTab]);

    const contextValue = useMemo(
        () => ({
            selectedTab,
            onSelectTab,
            registerTab,
        }),
        [selectedTab, onSelectTab, registerTab],
    );

    return (
        <TabbarContext.Provider value={contextValue}>
            <div
                ref={containerRef}
                className={classNames(styles.tabbar, className)}
                role="tablist"
            >
                {children}
                <div
                    className={styles.indicator}
                    style={{left: indicator.left, width: indicator.width}}
                />
            </div>
        </TabbarContext.Provider>
    );
}
