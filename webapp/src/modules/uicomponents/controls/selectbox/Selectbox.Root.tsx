import React, {type ReactElement, type ReactNode} from "react";
import {type SelectboxData, type SelectboxItem, useSelectbox} from "./useSelectbox.ts";
import classNames from "classnames";
import {FloatingFocusManager, FloatingPortal} from "@floating-ui/react";
import "./selectbox.less";
import { SelectboxContext } from "./Selectbox.Context.tsx";
import type {Selectbox_ListProps} from "@modules/uicomponents/controls/selectbox/Selectbox.List.tsx";
import type {Selectbox_ItemProps} from "@modules/uicomponents/controls/selectbox/Selectbox.Item.tsx";


type Selectbox_RootProps = {
    children: ReactNode;
    classNameFloating?: string,
    selectedItem?: SelectboxItem | null,
    onSelectedItemChange?: (item: SelectboxItem) => void;
    disabled?: boolean,
}

export function Selectbox_Root(props: Selectbox_RootProps): ReactElement {

    const items = getSelectboxItems(props.children);

    const selectbox = useSelectbox({
        items: items,
        selectedItem: props.selectedItem,
        onSelectedItemChange: props.onSelectedItemChange,
        disabled: props.disabled,
        transitionDuration: 200,
        listOffset: 4,
        listMatchWidth: true,
        listMaxHeight: 400,
    });

    const trueChildren = getTrueChildren(props.children);

    const itemChildren = getItemChildren(props.children, selectbox);

    return (
        <SelectboxContext.Provider value={{data: selectbox}}>

            <div className="selectbox__root">
                {trueChildren}
            </div>

            {selectbox.isMounted && (
                <FloatingPortal>
                    <FloatingFocusManager
                        context={selectbox.floatingUiContext}
                        initialFocus={-1}
                        visuallyHiddenDismiss
                    >
                        <div
                            className={"selectbox__list-container"}
                            ref={selectbox.refs.setListContainer}
                            {...selectbox.listContainerProps}
                        >
                            <div
                                className={classNames("selectbox__list", props.classNameFloating)}
                                {...selectbox.listProps}
                            >
                                {itemChildren}
                            </div>
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}

        </SelectboxContext.Provider>
    );
}

Selectbox_Root.displayName = "Selectbox.Root";

/**
 * Get the config items for the selectbox from "Selectbox.Item"
 */
function getSelectboxItems(children: ReactNode): SelectboxItem[] {
    const items: SelectboxItem[] = [];
    React.Children.forEach(children, (child: ReactNode) => {
        if (!React.isValidElement(child)) return;
        if ((child.type as any).displayName === "Selectbox.List") {
            const listProps = child.props as Selectbox_ListProps;
            React.Children.forEach(listProps.children, (listChild: ReactNode) => {
                if (!React.isValidElement(listChild)) return;
                if ((listChild.type as any).displayName === "Selectbox.Item") {
                    items.push({ key: listChild.key ?? "" });
                }
            });
        }
    });
    return items;
}

/**
 * Get the actual directly renderable children of Selectbox.Root
 */
function getTrueChildren(children: ReactNode): ReactNode[] {
    const trueChildren: ReactNode[] = [];
    React.Children.forEach(children, (child: ReactNode) => {
        if (!React.isValidElement(child)) return;
        if ((child.type as any).displayName !== "Selectbox.List") {
            trueChildren.push(child);
        }
    });
    return trueChildren;
}

/**
 * Returns the already filtered list of item children (i.e. Selectbox.Item)
 */
function getItemChildren(children: ReactNode, selectbox: SelectboxData): ReactNode[] {
    const itemElements: ReactNode[] = [];
    let itemElementIndex = 0;
    React.Children.forEach(children, (child: ReactNode) => {
        if (!React.isValidElement(child)) return;
        if ((child.type as any).displayName === "Selectbox.List") {
            const listProps = child.props as Selectbox_ListProps;
            React.Children.forEach(listProps.children, (listChild: ReactNode) => {
                if (!React.isValidElement(listChild)) return;
                if ((listChild.type as any).displayName === "Selectbox.Item") {
                    const itemProps = listChild.props as Selectbox_ItemProps;
                    const element = (
                        <div
                            key={listChild.key}
                            className="selectbox__item"
                            {...selectbox.itemProps(itemElementIndex)}
                        >
                            {itemProps.children}
                        </div>
                    );
                    itemElements.push(element);
                    itemElementIndex++;
                }
            });
        }
    });
    return itemElements;
}