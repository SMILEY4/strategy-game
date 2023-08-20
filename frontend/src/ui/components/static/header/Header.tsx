import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./header.scoped.less";

export interface HeaderProps {
    level?: 1 | 2 | 3 | 4,
    centered?: boolean,
    className?: string,
    children?: string
}

export function Header(props: HeaderProps): ReactElement {
    const classNames = joinClassNames([
        "header",
        props.centered ? "header--centered" : null,
        props.className
    ]);
    const level = props.level || 1
    if (level === 1) return <h1 className={classNames}>{props.children}</h1>;
    if (level === 2) return <h2 className={classNames}>{props.children}</h2>;
    if (level === 3) return <h3 className={classNames}>{props.children}</h3>;
    if (level === 4) return <h4 className={classNames}>{props.children}</h4>;
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