import {type ReactNode} from "react";
import "./combobox.less";


export type Combobox_ItemProps = {
    key: string
    textValue: string,
    children: ReactNode;
}

export function Combobox_Item(props: Combobox_ItemProps): ReactNode {
    return props.children;
}

Combobox_Item.displayName = "Combobox.Item";
