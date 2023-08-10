import {Meta, StoryObj} from "@storybook/react";
import React from "react";
import {CheckboxOutline} from "./CheckboxOutline";

const meta = {
    title: "Misc/CheckboxOutline",
    component: CheckboxOutline,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof CheckboxOutline>;

export default meta;
type Story = StoryObj<typeof CheckboxOutline>;


export const Default: Story = {
    args: {
        round: false
    },
};
