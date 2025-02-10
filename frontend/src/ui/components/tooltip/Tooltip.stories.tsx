import {StoryObj} from "@storybook/react";
import React from "react";
import {Tooltip} from "./Tooltip";

const meta = {
    title: "Controls/Tooltip",
    component: Tooltip.Context,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<{}>
export default meta;


export const Default: Story = {
    render: (args) => (
        <Tooltip.Context>
            <Tooltip.Trigger>
                <div>Hover!</div>
            </Tooltip.Trigger>
            <Tooltip.Content>
                <div>Tooltip</div>
            </Tooltip.Content>
        </Tooltip.Context>
    ),
};
