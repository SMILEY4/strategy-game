import {Meta, StoryObj} from "@storybook/react";
import React from "react";
import {CheckboxPrimary} from "./CheckboxPrimary";

const meta = {
    title: "Misc/CheckboxPrimary",
    component: CheckboxPrimary,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof CheckboxPrimary>;

export default meta;
type Story = StoryObj<typeof CheckboxPrimary>;


export const Default: Story = {
    args: {
        round: false,
        borderType: "gold"
    },
};
