import {CSSProperties, ReactElement} from "react";
import {joinClassNames} from "../window/utils";
import "./header.scoped.less";
import {BaseProps} from "../base/base";

export interface HeaderProps extends BaseProps {
    level?: 1 | 2 | 3 | 4 | 5,
    centered?: boolean,
    inline?: boolean,
    children?: string
}

export function Header(props: HeaderProps): ReactElement {
    const classNames = joinClassNames([
        "header",
        props.centered ? "header--centered" : null,
        props.inline ? "header--inline" : null,
        ...BaseProps.buildBaseClassNames(props)
    ]);
    const level = props.level || 1
    if (level === 1) return <h1 className={classNames} style={props.style}>{props.children}</h1>;
    if (level === 2) return <h2 className={classNames} style={props.style}>{props.children}</h2>;
    if (level === 3) return <h3 className={classNames} style={props.style}>{props.children}</h3>;
    if (level === 4) return <h4 className={classNames} style={props.style}>{props.children}</h4>;
    if (level === 5) return <h5 className={classNames} style={props.style}>{props.children}</h5>;
    return null as any;
}

export function Header1(props: HeaderProps): ReactElement {
    return <Header {...props} level={1}/>;
}

export function Header2(props: HeaderProps): ReactElement {
    return <Header {...props} level={2}/>;
}

export function Header3(props: HeaderProps): ReactElement {
    return <Header {...props} level={3}/>;
}

export function Header4(props: HeaderProps): ReactElement {
    return <Header {...props} level={4}/>;
}

export function Header5(props: HeaderProps): ReactElement {
    return <Header {...props} level={5}/>;
}