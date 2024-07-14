import {StoryObj} from "@storybook/react";
import React from "react";
import {TooltipContent, TooltipContext, TooltipTrigger} from "./TooltipContext";

const meta = {
    title: "Controls/Tooltip",
    component: TooltipContext,
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
        <TooltipContext>
            <TooltipTrigger>
                <div>Hover!</div>
            </TooltipTrigger>
            <TooltipContent>
                <div>Tooltip</div>
            </TooltipContent>
        </TooltipContext>
    ),
};
