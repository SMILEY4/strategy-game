import {type ReactElement, type ReactNode} from "react";
import {Panel} from "@modules/uicomponents/panel/Panel.tsx";
import styles from "./simpleWindow.module.less";
import classNames from "classnames";
import {Separator} from "@modules/uicomponents/separator/Separator.tsx";
import {Txt} from "@modules/uicomponents/text/Txt";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {Icon} from "@modules/uicomponents/icon/Icon";
import {useWindowInteractions} from "@modules/uicomponents/window/useWindow.ts";


type SimpleWindowProps = {
    windowId: string;

    title: string;
    withCloseButton?: boolean;

    children: ReactNode,
    className?: string;
}

export function SimpleWindow(props: SimpleWindowProps): ReactElement {

    const {
        windowId,
        title,
        className,
        children,
        withCloseButton = true,
    } = props;

    const {
        resizerProps,
        dragProps,
        refContent,
        closeWindow,
    } = useWindowInteractions(windowId);

    return (
        <Panel.Decorated metalBorder roundedCorner paperPattern fillParent ref={refContent}>
            <div className={classNames(styles["simple-window"], className)}>

                <div
                    {...dragProps}
                    className={classNames(styles["header"])}
                >
                    <Txt.Heading h4>{title}</Txt.Heading>
                    <div className="actions">
                        {withCloseButton && (
                            <Button circle sizeS onClick={closeWindow} playClose><Icon.Cross/></Button>
                        )}
                    </div>
                </div>

                <Separator horizontal line none/>

                <div className={styles["content"]}>
                    {children}
                </div>

                <div
                    {...resizerProps}
                    className={styles["resizer"]}
                />

            </div>
        </Panel.Decorated>
    );
}