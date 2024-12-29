import {CSSProperties} from "react";

export interface BaseProps {

    // 100% width & height
    noFullSize?: boolean;
    fullWidth?: boolean,
    fullHeight?: boolean,
    fullSize?: boolean,

    // flex-grow & shrink
    grow?: boolean,
    shrink?: boolean,
    dontGrow?: boolean,
    dontShrink?: boolean,

    // class names
    className?: string;
    classNames?: string[],

    // style
    style?: CSSProperties;
}

export namespace BaseProps {

    export function buildBaseClassNames(props: BaseProps): (string | null | undefined)[] {
        return [

            props.noFullSize ? "base--no-full-size" : null,
            props.fullWidth ? "base--full-width" : null,
            props.fullHeight ? "base--full-height" : null,
            props.fullSize ? "base--full-size" : null,

            props.grow ? "base--grow" : null,
            props.shrink ? "base--shrink" : null,

            props.dontGrow ? "base--dont-grow" : null,
            props.dontShrink ? "base--dont-shrink" : null,

            props.className,
            ...(props.classNames ?? []),
        ];
    }

}
