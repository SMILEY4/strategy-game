import {Meta, StoryObj} from "@storybook/react";
import React from "react";
import {TextFieldPrimary} from "./TextFieldPrimary";

const meta = {
    title: "Controls/TextField/Primary",
    component: TextFieldPrimary,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof TextFieldPrimary>;

export default meta;
type Story = StoryObj<typeof TextFieldPrimary>;


export const Default: Story = {
    args: {
        value: "",
        placeholder: "Placeholder",
        type: "text",
    },
};
