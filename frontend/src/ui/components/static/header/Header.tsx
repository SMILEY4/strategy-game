import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./header.scoped.less"

export interface HeaderProps {
    level?: 1 | 2 | 3 | 4,
    className?: string,
    children?: string
}

export function Header(props: HeaderProps): ReactElement {
    if(props.level === 1 || props.level == undefined) {
        return (
            <h1 className={joinClassNames(["header", props.className])}>
                {props.children}
            </h1>
        )
    }
    if(props.level === 2) {
        return (
            <h2 className={joinClassNames(["header", props.className])}>
                {props.children}
            </h2>
        )
    }
    if(props.level === 3) {
        return (
            <h3 className={joinClassNames(["header", props.className])}>
                {props.children}
            </h3>
        )
    }
    if(props.level === 4) {
        return (
            <h4 className={joinClassNames(["header", props.className])}>
                {props.children}
            </h4>
        )
    }
    return null as any;
}

export function Header1(props: HeaderProps): ReactElement {
    return <Header {...props} level={1}/>
}

export function Header2(props: HeaderProps): ReactElement {
    return <Header {...props} level={2}/>
}

export function Header3(props: HeaderProps): ReactElement {
    return <Header {...props} level={3}/>
}

export function Header4(props: HeaderProps): ReactElement {
    return <Header {...props} level={4}/>
}