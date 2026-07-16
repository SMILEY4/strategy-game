import {type ComponentPropsWithoutRef, type ReactElement} from "react";
import classNames from "classnames";
import styles from "./selectbox.module.less";
import {useSelectboxContext} from "@modules/uicomponents/controls/selectbox/Selectbox.Context.tsx";
import {Icon} from "../../icon/Icon";

type Shape =
    | "box"
    | "pill"

type ShapeShorthands = {
    box?: boolean;
    pill?: boolean;
};

type Size =
    | "s"
    | "m"
    | "l";

type SizeShorthands = {
    sizeS?: boolean;
    sizeM?: boolean;
    sizeL?: boolean;
};

type State =
    | "neutral"
    | "success"
    | "error";

type StateShorthands = {
    success?: boolean;
    error?: boolean;
};

type Selectbox_ControlProps = {
        shape?: Shape;
        size?: Size;
        state?: State;
        stableSize?: boolean;
        children?: never;
    }
    & Omit<ComponentPropsWithoutRef<"div">, "children">
    & ShapeShorthands
    & SizeShorthands
    & StateShorthands


export function Selectbox_Control(props: Selectbox_ControlProps): ReactElement {

    const {
        className,
        stableSize,

        // shape
        shape,
        box,
        pill,

        // size
        size,
        sizeS,
        sizeM,
        sizeL,

        // state
        state,
        success,
        error,

        // safe DOM props
        ...rest
    } = props;

    const selectbox = useSelectboxContext();

    const display = selectbox.selectedItem
        ? selectbox.renderItem(selectbox.selectedItem)
        : null;

    const shapeResolved = resolveShape({
        shape,
        box,
        pill,
    });

    const sizeResolved = resolveSize({
        size,
        sizeS,
        sizeM,
        sizeL,
    });

    const stateResolved = resolveState({
        state,
        success,
        error,
    });


    return (
        <div
            {...rest}
            className={classNames(styles.control, className)}
            data-shape={shapeResolved}
            data-size={sizeResolved}
            data-state={stateResolved}
            tabIndex={0}
            {...selectbox.data.elementProps}
            ref={selectbox.data.refs.setElement}
        >
            <div className={styles.control__inner}>
                <div className={classNames(
                    styles.control__content,
                    stableSize && styles['control__content--stable'],
                )}>
                    {
                        props.stableSize
                            ? (
                                <>
                                    {
                                        selectbox.items.map(item => (
                                            <div
                                                key={item.key}
                                                className={classNames(
                                                    styles.control__content__item,
                                                    styles['control__content__item--hidden']
                                                )}
                                            >
                                                {selectbox.renderItem(item)}
                                            </div>
                                        ))
                                    }
                                    <div className={styles.control__content__item}>
                                        {display}
                                    </div>
                                </>
                            )
                            : (
                                <div className={styles.control__content__item}>
                                    {display}
                                </div>
                            )
                    }
                </div>
                <Icon.ChevronDown className={classNames(
                    styles.chevron,
                    {[styles['chevron--open']]: selectbox.data.status === "open"},
                )}/>
            </div>
        </div>
    );
}

Selectbox_Control.displayName = "Selectbox.Control";

function resolveShape(props: { shape?: Shape } & ShapeShorthands): Shape | undefined {
    if (props.shape) return props.shape;
    if (props.box) return "box";
    if (props.pill) return "pill";
    return undefined;
}

function resolveSize(props: { size?: Size } & SizeShorthands): Size | undefined {
    if (props.size) return props.size;
    if (props.sizeS) return "s";
    if (props.sizeM) return "m";
    if (props.sizeL) return "l";
    return undefined;
}

function resolveState(props: { state?: State } & StateShorthands): State | undefined {
    if (props.state) return props.state;
    if (props.error) return "error";
    if (props.success) return "success";
    return undefined;
}
