import React, {type ReactElement, type ReactNode} from "react";
import {type ComboboxData, type ComboboxItem, useCombobox} from "./useCombobox.ts";
import classNames from "classnames";
import {FloatingFocusManager, FloatingPortal} from "@floating-ui/react";
import "./combobox.less";
import { ComboBoxContext } from "./ComboBox.Context.tsx";
import type {Combobox_ListProps} from "@modules/uicomponents/controls/combobox/Combobox.List.tsx";
import type {Combobox_ItemProps} from "@modules/uicomponents/controls/combobox/Combobox.Item.tsx";


type Combobox_RootProps = {
    children: ReactNode;
    classNameFloating?: string,
    selectedItem?: ComboboxItem | null,
    onSelectedItemChange?: (item: ComboboxItem) => void;
    disabled?: boolean,
}

export function Combobox_Root(props: Combobox_RootProps): ReactElement {

    const items = getComboboxItems(props.children);

    const combobox = useCombobox({
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

    const itemChildren = getItemChildren(props.children, combobox);

    return (
        <ComboBoxContext.Provider value={{data: combobox}}>

            <div className="combobox__root">
                {trueChildren}
            </div>

            {combobox.isMounted && (
                <FloatingPortal>
                    <FloatingFocusManager
                        context={combobox.floatingUiContext}
                        initialFocus={-1}
                        visuallyHiddenDismiss
                    >
                        <div
                            className={"combobox__list-container"}
                            ref={combobox.refs.setListContainer}
                            {...combobox.listContainerProps}
                        >
                            <div
                                className={classNames("combobox__list", props.classNameFloating)}
                                {...combobox.listProps}
                            >
                                {itemChildren}
                            </div>
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}

        </ComboBoxContext.Provider>
    );
}

Combobox_Root.displayName = "Combobox.Root";

/**
 * Get the config items for the combobox from "Combobox.Item"
 */
function getComboboxItems(children: ReactNode): ComboboxItem[] {
    const items: ComboboxItem[] = [];
    React.Children.forEach(children, (child: ReactNode) => {
        if (!React.isValidElement(child)) return;
        if ((child.type as any).displayName === "Combobox.List") {
            const listProps = child.props as Combobox_ListProps;
            React.Children.forEach(listProps.children, (listChild: ReactNode) => {
                if (!React.isValidElement(listChild)) return;
                if ((listChild.type as any).displayName === "Combobox.Item") {
                    const itemProps = listChild.props as Combobox_ItemProps;
                    items.push({
                        key: listChild.key ?? "",
                        textValue: itemProps.textValue,
                    });
                }
            });
        }
    });
    return items;
}

/**
 * Get the actual directly renderable children of Combobox.Root
 */
function getTrueChildren(children: ReactNode): ReactNode[] {
    const trueChildren: ReactNode[] = [];
    React.Children.forEach(children, (child: ReactNode) => {
        if (!React.isValidElement(child)) return;
        if ((child.type as any).displayName !== "Combobox.List") {
            trueChildren.push(child);
        }
    });
    return trueChildren;
}

/**
 * Returns the already filtered list of item children (i.e. Combobox.Item)
 */
function getItemChildren(children: ReactNode, combobox: ComboboxData): ReactNode[] {
    const itemElements: ReactNode[] = [];
    let itemElementIndex = 0;
    React.Children.forEach(children, (child: ReactNode) => {
        if (!React.isValidElement(child)) return;
        if ((child.type as any).displayName === "Combobox.List") {
            const listProps = child.props as Combobox_ListProps;
            React.Children.forEach(listProps.children, (listChild: ReactNode) => {
                if (!React.isValidElement(listChild)) return;
                if ((listChild.type as any).displayName === "Combobox.Item") {

                    const mask = combobox.itemMask[itemElementIndex] ?? false;
                    if (!mask) {
                        itemElementIndex++;
                        return;
                    }

                    const itemProps = listChild.props as Combobox_ItemProps;
                    const element = (
                        <div
                            key={listChild.key}
                            className="combobox__item"
                            {...combobox.itemProps(itemElementIndex)}
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