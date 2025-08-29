import {DecoratedPanel, DecoratedPanelProps} from "./DecoratedPanel";
import {StoryObj} from "@storybook/react";
import React from "react";
import {VBox} from "../../layout/vbox/VBox";
import {CSS_COLOR_SUCCESS_LIGHT, CSS_COLOR_WARN_LIGHT} from "../../commonColors";

const meta = {
    title: "Panels/Decorated",
    component: DecoratedPanel,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<DecoratedPanelProps & {
    border: undefined | "ornament" | "simple" | "simpleDashed"

}>
export default meta;

export const Default: Story = {
    render: (args) => (
        <DecoratedPanel
            ornament={args.ornament}
            simple={args.simple}
            simpleDashed={args.simpleDashed}
            blue={args.blue}
            pattern={args.pattern}
        >
            Content
        </DecoratedPanel>
    ),
};


export const ExampleListEntries: Story = {
    render: (args) => (
        <DecoratedPanel ornament>
            <VBox gap_s>
                <DecoratedPanel simple blue>Simple Item</DecoratedPanel>
                <DecoratedPanel simple blue pattern>Item with pattern</DecoratedPanel>
                <DecoratedPanel
                    simple
                    blue
                    background={<DecoratedPanel.ColorBackground color={CSS_COLOR_SUCCESS_LIGHT}/>}
                >
                    Item with color 1
                </DecoratedPanel>
                <DecoratedPanel
                    simple
                    blue
                    background={<DecoratedPanel.ColorBackground color={CSS_COLOR_WARN_LIGHT}/>}
                >
                    Item with color 2
                </DecoratedPanel>
                <DecoratedPanel
                    simple
                    blue
                    background={
                        <DecoratedPanel.ImageBackground
                            gradient
                            url="icons/production/building.FARM.png"
                        />
                    }
                >
                    Item with image 1
                </DecoratedPanel>
                <DecoratedPanel
                    simple
                    blue
                    background={
                        <DecoratedPanel.ImageBackground
                            gradient
                            url="icons/production/building.WOODCUTTER.png"
                            desaturated
                            reducedOpacity
                        />
                    }
                >
                    Item with image 2
                </DecoratedPanel>
            </VBox>
        </DecoratedPanel>
    ),
};
