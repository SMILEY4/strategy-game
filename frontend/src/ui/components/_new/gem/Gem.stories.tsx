import {Meta, StoryObj} from "@storybook/react";
import {Gem} from "./Gem";

const meta = {
    title: "Misc/Gem",
    component: Gem,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Gem>;

export default meta;
type Story = StoryObj<typeof Gem>;


export const Default: Story = {
    args: {
        interactive: true,
        disabled: false,
        round: false,
        children:
            <div style={{
                width: "220px",
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


