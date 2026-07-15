import {type ReactNode} from "react";
import "./combobox.less";

export type Combobox_ListProps = {
    children: ReactNode;
}

export function Combobox_List(props: Combobox_ListProps): ReactNode {
    return props.children;
}

Combobox_List.displayName = "Combobox.List";
