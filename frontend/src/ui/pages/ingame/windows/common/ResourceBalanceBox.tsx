import React, {useState} from "react";
import {
    autoUpdate,
    flip,
    FloatingPortal,
    shift,
    useFloating,
    useHover,
    useInteractions,
    useRole,
} from "@floating-ui/react";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Text} from "../../../../components/text/Text";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Header4} from "../../../../components/header/Header";
import {ResourceBalanceData} from "../../../../models/resourceBalanceData";
import "./resourceBalanceBox.less";


export function ResourceBalanceBox(props: { data: ResourceBalanceData }) {

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

    return (
        <>
            <InsetPanel className="resource-box">
                <div
                    className="resource-box__icon"
                    style={{backgroundImage: "url('" + props.data.icon + "')"}}
                    ref={refs.setReference}
                    {...getReferenceProps()}
                />
                {isOpen && (
                    <FloatingPortal id="root">
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            className={"resource-tooltip-wrapper"}
                            {...getFloatingProps()}
                        >
                            <ResourceTooltipContent data={props.data}/>
                        </div>
                    </FloatingPortal>
                )}
                <Text
                    className="resource-box__text"
                    type={getValueType(props.data.value)}
                >
                    {formatValue(props.data.value)}
                </Text>
            </InsetPanel>
        </>
    );

    function formatValue(value: number): string {
        const simpleValue = Math.round(value * 100) / 100;
        if (simpleValue < 0) {
            return "" + simpleValue;
        }
        if (simpleValue > 0) {
            return "+" + simpleValue;
        }
        return "0";
    }

    function getValueType(value: number): "positive" | "negative" | undefined {
        if (value > 0) {
            return "positive";
        }
        if (value < 0) {
            return "negative";
        }
        return undefined;
    }

}


function ResourceTooltipContent(props: { data: ResourceBalanceData }) {
    return (
        <div className={"resource-tooltip"}>
            <VBox padding_m gap_s fillParent className={"resource-tooltip_inner"}>
                <Header4>{props.data.name}</Header4>
                {props.data.contributions.map(contribution => (
                    <Text type={contribution.value < 0 ? "negative" : "positive"}>{contribution.reason}</Text>
                ))}
            </VBox>
        </div>
    );
}