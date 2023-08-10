import {Meta, StoryObj} from "@storybook/react";
import {MetalBorder} from "./MetalBorder";

const meta = {
    title: "Objects/Metal_Border",
    component: MetalBorder,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof MetalBorder>;

export default meta;
type Story = StoryObj<typeof MetalBorder>;


export const Default: Story = {
    args: {
        round: false,
        type: "gold",
        children:
            <div style={{
                width: "60px",
                height: "60px",
            }}/>,
    },
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
    },
};


