import {Meta, StoryObj} from "@storybook/react";
import {TabPane} from "./TabPane";

const meta = {
    title: "Objects/TabPane",
    component: TabPane,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof TabPane>;

export default meta;
type Story = StoryObj<typeof TabPane>;


export const Default: Story = {
    args: {
    },
};


