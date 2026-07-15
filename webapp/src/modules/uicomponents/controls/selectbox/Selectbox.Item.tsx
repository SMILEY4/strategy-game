import {type ReactNode} from "react";
import "./selectbox.less";


export type Selectbox_ItemProps = {
    key: string
    children: ReactNode;
}

export function Selectbox_Item(props: Selectbox_ItemProps): ReactNode {
    return props.children;
}

Selectbox_Item.displayName = "Selectbox.Item";
