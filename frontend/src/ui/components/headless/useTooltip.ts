import {useState} from "react";
import {autoUpdate, flip, shift, useFloating, useHover, useInteractions, useRole} from "@floating-ui/react";

export function useTooltip() {

    const [isOpen, setIsOpen] = useState(false);

    const {refs, floatingStyles, context} = useFloating({
        open: isOpen,
        onOpenChange: setIsOpen,
        middleware: [flip({padding: 20}), shift()],
        whileElementsMounted: autoUpdate,
    });

    const hover = useHover(context, {move: false});
    const role = useRole(context, {role: "tooltip"});
    const {getReferenceProps, getFloatingProps} = useInteractions([hover, role]);

    return {
        isOpen: isOpen,
        refTrigger: refs.setReference,
        propsTrigger: getReferenceProps(),
        refTooltip: refs.setFloating,
        propsTooltip: getFloatingProps(),
        styleTooltip: floatingStyles
    }
}