import React, {ReactElement} from "react";
import {Header2} from "../header/Header";
import {Divider} from "../divider/Divider";
import {When} from "react-if";

export function WindowSection(props: { title?: string, children?: any }): ReactElement {
    return (
        <>
            <When condition={!!props.title}>
                <Header2 centered>{props.title}</Header2>
                <Divider/>
            </When>
            {props.children}
        </>
    );
}