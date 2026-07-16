import React, {type ReactElement, type ReactNode} from "react";
import {type SelectboxData, type SelectboxItem, useSelectbox} from "./useSelectbox.ts";
import classNames from "classnames";
import {FloatingFocusManager, FloatingPortal} from "@floating-ui/react";
import styles from "./selectbox.module.less";
import {SelectboxContext} from "./Selectbox.Context.tsx";
import type {Selectbox_ListProps} from "@modules/uicomponents/controls/selectbox/Selectbox.List.tsx";
import type {Selectbox_ItemProps} from "@modules/uicomponents/controls/selectbox/Selectbox.Item.tsx";
import {Selectbox} from "@modules/uicomponents/controls/selectbox/Selectbox.ts";


type Selectbox_RootProps<TItem extends SelectboxItem> = {
    children: ReactNode;
    classNameFloating?: string,

    disabled?: boolean,

    items?: TItem[]
    renderItem?: (item: TItem) => ReactElement
    selectedItem?: TItem | null,
    onSelectedItemChange?: (item: TItem) => void;
}

export function Selectbox_Root<TItem extends SelectboxItem>(props: Selectbox_RootProps<TItem>): ReactElement {

    const renderFunc = props.renderItem;
    const renderItemFunc = renderFunc
        ? (item: SelectboxItem) => renderFunc(item as TItem)
        : (item: SelectboxItem) => (<Selectbox.Item key={item.key}>{item.key}</Selectbox.Item>)

    const listData = getListProps(props.children);

    const selectbox = useSelectbox({
        items: props.items ?? [],
        selectedItem: props.selectedItem,
        onSelectedItemChange: item => props.onSelectedItemChange?.(item as TItem),
        disabled: props.disabled,
        ...(listData ? listData : {}),
    });

    const trueChildren = getTrueChildren(props.children);

    const listChildren = renderListItems(
        props.items ?? [],
        renderItemFunc,
        selectbox,
    );

    return (
        <SelectboxContext.Provider value={{
            data: selectbox,
            items: props.items ?? [],
            renderItem: renderItemFunc,
        }}>

            <div className={styles.root}>
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
                            className={styles.listContainer}
                            ref={selectbox.refs.setListContainer}
                            {...selectbox.listContainerProps}
                        >
                            <div
                                className={classNames(styles.list, props.classNameFloating)}
                                {...selectbox.listProps}
                            >
                                {listChildren}
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
 * Get properties from the Selectbox.List child.
 */
function getListProps(children: ReactNode): Selectbox_ListProps | null {
    let listElement: React.ReactElement | undefined;
    React.Children.forEach(children, (child: ReactNode) => {
        if (listElement) return;
        if (React.isValidElement(child) && (child.type as any).displayName === "Selectbox.List") {
            listElement = child;
        }
    });
    if (!listElement) return null;
    return listElement.props as Selectbox_ListProps;
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

function renderListItems(items: SelectboxItem[], renderFunc: (item: SelectboxItem) => ReactElement, selectbox: SelectboxData): ReactNode[] {
    const itemElements: ReactNode[] = [];
    let itemElementIndex = 0;
    items.forEach(item => {
        const itemRendered = renderFunc(item);
        if (!React.isValidElement(itemRendered)) return;
        if ((itemRendered.type as any).displayName === "Selectbox.Item") {
            const itemProps = itemRendered.props as Selectbox_ItemProps;
            const element = (
                <div
                    key={itemRendered.key}
                    className={styles.item}
                    {...selectbox.itemProps(itemElementIndex)}
                >
                    {itemProps.children}
                </div>
            );
            itemElements.push(element);
            itemElementIndex++;
        }
    });
    return itemElements;
}