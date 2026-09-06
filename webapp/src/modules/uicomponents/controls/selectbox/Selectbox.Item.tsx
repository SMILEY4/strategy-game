import {type ReactNode} from "react";


export type Selectbox_ItemProps = {
    key: string | number
    children: ReactNode;
}

export function Selectbox_Item(props: Selectbox_ItemProps): ReactNode {
    return props.children;
}

Selectbox_Item.displayName = "Selectbox.Item";
