import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";

type Level = 1 | 2 | 3 | 4 | 5 | 6

type LevelShorthands = {
    h1?: boolean,
    h2?: boolean,
    h3?: boolean,
    h4?: boolean,
    h5?: boolean,
    h6?: boolean,
}

export type Txt_HeadingProps = {
        level?: Level,
        light?: boolean,
    }
    & ComponentPropsWithRef<"h1">
    & LevelShorthands


export function Txt_Heading(props: Txt_HeadingProps): ReactElement {

    const {
        light = false,
        className,
        children,

        level,
        h1, h2, h3, h4, h5, h6,

        ...rest
    } = props;

    const levelResolved = resolveLevel({ level, h1, h2, h3, h4, h5, h6})

    const Tag = `h${Math.min(Math.max(levelResolved, 1), 6)}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    return (
        <Tag
            {...rest}
            className={classNames("txt", "txt--heading", className)}
            data-level={level}
            data-light={light || undefined}
        >
            {children}
        </Tag>
    );
}

function resolveLevel(props: { level?: Level } & LevelShorthands): Level {
    if(props.level) return props.level
    if(props.h1) return 1;
    if(props.h2) return 2;
    if(props.h3) return 3;
    if(props.h4) return 4;
    if(props.h5) return 5;
    if(props.h6) return 6;
    return 1;
}
