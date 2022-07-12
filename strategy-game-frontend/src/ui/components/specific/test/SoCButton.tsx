import {ReactElement} from "react";
import "./socButton.css";

export function SoCButton(props: { children: any }): ReactElement {

    return (
        <div className="socButton__wrapper">
            <div className="socButton__outer">
                <div className="socButton_inner">
                    {props.children}
                </div>
            </div>
            <div className="socButton_background"/>
        </div>
    );

}