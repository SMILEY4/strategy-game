import {ReactElement} from "react";
import "./etElements.scoped.less";
import {joinClassNames} from "../../utils";

export interface ETImageIconProps {
    url: string,
}

export function ETImageIcon(props: ETImageIconProps): ReactElement {

    return (
        <span
            className={joinClassNames([
                "et-element",
                "et-image-icon",
            ])}
            style={{
                backgroundImage: `url(${props.url})`,
            }}
        />
    );

}