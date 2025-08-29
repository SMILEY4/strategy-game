import {StoryObj} from "@storybook/react";
import React from "react";
import {TooltipPanel} from "./TooltipPanel";

const meta = {
    title: "Panels/Tooltip",
    component: TooltipPanel,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof TooltipPanel>
export default meta;


export const Default: Story = {
    render: () => (
        <TooltipPanel>
            <DummyContent/>
        </TooltipPanel>
    ),
};

function DummyContent() {
    return (
        <div style={{
            width: "100px",
            height: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
        }}>
            Content
        </div>
    );
}
