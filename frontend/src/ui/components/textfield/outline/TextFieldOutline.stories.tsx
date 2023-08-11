import {Meta, StoryObj} from "@storybook/react";
import React from "react";
import {TextFieldOutline} from "./TextFieldOutline";

const meta = {
    title: "Controls/TextField/Outline",
    component: TextFieldOutline,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof TextFieldOutline>;

export default meta;
type Story = StoryObj<typeof TextFieldOutline>;


export const Default: Story = {
    args: {
        value: "",
        placeholder: "Placeholder",
        type: "text",
    },
};
