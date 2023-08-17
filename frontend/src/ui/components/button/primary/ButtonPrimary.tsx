import {ReactElement} from "react";
import "./buttonPrimary.scoped.less"

export interface ButtonPrimaryProps {
}

export function ButtonPrimary(props: ButtonPrimaryProps): ReactElement {
    return (
        <div className="button">
            <div className="button__inner">
                Button
            </div>
        </div>
    )
}