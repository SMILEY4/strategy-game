import {type KeyboardEvent, useRef, useState} from "react";
import {
    autoUpdate,
    flip,
    type FloatingRootContext,
    offset,
    size,
    useDismiss,
    useFloating,
    useInteractions,
    useListNavigation,
    useTransitionStatus,
} from "@floating-ui/react";
import {useHover} from "@modules/uicomponents/hooks/useHover.ts";

export interface SelectboxItem {
    key: string;
}

export interface SelectboxOptions {

    items: SelectboxItem[],

    selectedItem?: SelectboxItem | null,
    onSelectedItemChange?: (item: SelectboxItem) => void;

    disabled?: boolean,

    transitionDuration?: number
    listOffset?: number,
    listMatchWidth?: boolean,
    listMaxHeight?: number,
}

export interface SelectboxData {
    elementProps: Record<string, unknown>
    listContainerProps: Record<string, unknown>,
    listProps: Record<string, unknown>,
    itemProps: (index: number) => Record<string, unknown>,
    refs: {
        setElement: (node: HTMLElement | null) => void,
        setListContainer: (node: HTMLElement | null) => void,

    }
    isMounted: boolean,
    isHover: boolean,
    status: string,
    activeIndex: number | null,
    floatingUiContext: FloatingRootContext,
}

export function useSelectbox(options: SelectboxOptions): SelectboxData {

    // whether the dropdown list is open
    const [isOpen, setIsOpen] = useState(false);

    // the index of the element currently hovered over or highlighted via keyboard
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // handle hover state
    const hover = useHover();

    // ref to the list of html elements for the items
    const listRef = useRef<Array<HTMLElement | null>>([]);

    // The main hook that acts as a controller for all other hooks and components.
    const {refs, floatingStyles, context} = useFloating<HTMLInputElement>({
        placement: "bottom",
        open: isOpen,
        onOpenChange: setIsOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(options.listOffset === undefined ? 0 : options.listOffset),
            flip({padding: 10,}),
            size({
                apply({rects, availableHeight, elements}) {
                    Object.assign(elements.floating.style, {
                        maxHeight: options.listMaxHeight
                            ? Math.min(options.listMaxHeight, availableHeight) + "px"
                            : `${availableHeight}px`,
                        width: `${rects.reference.width}px`,
                        minWidth: `${rects.reference.width}px`,
                        maxWidth: options.listMatchWidth === true
                            ? `${rects.reference.width}px`
                            : undefined,
                    });
                },
                padding: 10,
            }),
        ],
    });

    // Closes the floating element when a dismissal is requested — by default, when the user presses the escape key or
    // outside the floating element with their pointer.
    const dismiss = useDismiss(context);

    // Adds arrow key-based navigation of a list of items, either using real DOM focus or virtual focus.
    const listNav = useListNavigation(context, {
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
        virtual: true,
        loop: true,
    });

    // A hook to merge or compose interaction event handlers together, preserving memoization.
    const {getReferenceProps, getFloatingProps, getItemProps} = useInteractions(
        [dismiss, listNav],
    );

    // provides a status for transition animations
    const {isMounted, status} = useTransitionStatus(context, {
        duration: options.transitionDuration ?? 0,
    });

    // handle clicking on the text input field, opens the dropdown list
    function onInputClick() {
        if (!isOpen && options.disabled !== true) {
            setIsOpen(true);
        }
    }

    function selectItem(selected: SelectboxItem) {
        // Keep prevSelectedKeyRef in sync so the effect doesn't re-override
        // the value if the parent echoes the same item back via selectedItem.
        setActiveIndex(null);
        setIsOpen(false);
        refs.domReference.current?.focus();
        options.onSelectedItemChange?.(selected);
    }

    // handle a key down event on the text input field, closes and confirms the selected item
    function onInputKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" && activeIndex != null && options.items[activeIndex]) {
            const selected = options.items[activeIndex];
            selectItem(selected);
        }
    }

    // handle user clicking on an item in the list
    function onItemClick(index: number) {
        const selected = options.items[index]!;
        selectItem(selected);
    }

    // handle the element getting unfocused (for some additional cases)
    function onBlur() {
        setIsOpen(false);
    }

    const referenceProps = getReferenceProps({
        ...hover.elementProps
    })

    return {
        elementProps: {
            ...referenceProps,
            onClick(event: MouseEvent) {
                (referenceProps as any).onClick?.(event)
                onInputClick();
            },
            onKeyDown(event: KeyboardEvent) {
                (referenceProps as any).onKeyDown?.(event)
                onInputKeyDown(event);
            },
            onBlur: () => onBlur(),
            "data-disabled": options.disabled ? "" : undefined,
            "data-hover": hover.isHovered ? "" : undefined,
            "data-open": isOpen,
        },
        listContainerProps: {
            ...getFloatingProps({
                style: floatingStyles,
            }),
        },
        listProps: {
            "data-status": status,
            "data-placement": context.placement,
        },
        itemProps: (index: number) => ({
            ...getItemProps({
                ref(node) {
                    listRef.current[index] = node;
                },
                onClick() {
                    onItemClick(index);
                },
            }),
            "data-active": index === activeIndex ? "" : undefined,
        }),
        refs: {
            setElement: refs.setReference,
            setListContainer: refs.setFloating,
        },
        activeIndex: activeIndex,
        isMounted: isMounted,
        isHover: hover.isHovered,
        floatingUiContext: context,
        status: status,
    };
}