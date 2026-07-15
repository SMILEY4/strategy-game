import {type ComponentPropsWithoutRef, type ReactElement} from "react";
import classNames from "classnames";
import "./combobox.less";
import {useComboBoxContext} from "@modules/uicomponents/controls/combobox/ComboBox.Context.tsx";
import { Icon } from "../../icon/Icon";

type Shape =
    | "rounded"
    | "pill"

type ShapeShorthands = {
    rounded?: boolean;
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

type Combobox_ControlProps = {
        shape?: Shape;
        size?: Size;
        state?: State;
    }
    & ComponentPropsWithoutRef<"div">
    & ShapeShorthands
    & SizeShorthands
    & StateShorthands


export function Combobox_Control(props: Combobox_ControlProps): ReactElement {

    const {
        className,
        children,

        // shape
        shape,
        rounded,
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

    const combobox = useComboBoxContext();

    const shapeResolved = resolveShape({
        shape,
        box: rounded,
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
            className={classNames("combobox__control", className)}
            data-shape={shapeResolved}
            data-size={sizeResolved}
            data-state={stateResolved}
            {...combobox.data.elementProps}
            ref={combobox.data.refs.setElement}
        >
            {children}
            <Icon.ChevronDown className={classNames(
                "combobox__chevron",
                {"combobox__chevron--open": combobox.data.status === "open"},
            )}/>
        </div>
    );
}

Combobox_Control.displayName = "Combobox.Control";

function resolveShape(props: { shape?: Shape } & ShapeShorthands): Shape | undefined {
    if (props.shape) return props.shape;
    if (props.rounded) return "rounded";
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
