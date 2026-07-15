import {type ReactNode} from "react";
import "./selectbox.less";

export type Selectbox_ListProps = {
    children: ReactNode;
}

export function Selectbox_List(props: Selectbox_ListProps): ReactNode {
    return props.children;
}

Selectbox_List.displayName = "Selectbox.List";
