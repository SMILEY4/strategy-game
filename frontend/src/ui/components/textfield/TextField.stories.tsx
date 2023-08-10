import {Meta, StoryObj} from "@storybook/react";
import React from "react";
import {TextField} from "./TextField";

const meta = {
    title: "Controls/TextField/Primary",
    component: TextField,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof TextField>;


export const Default: Story = {
    args: {
        value: "",
        placeholder: "Placeholder",
        type: "text",
    }
};
