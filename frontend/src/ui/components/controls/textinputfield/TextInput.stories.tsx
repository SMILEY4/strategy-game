import {Meta, StoryObj} from "@storybook/react";
import {TextInput} from "./TextInput";
import React from "react";

const meta = {
    title: "Control/Input/TextInput",
    component: TextInput,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof TextInput>;


export const GoldBorder: Story = {
    render: () => (
        <TextInput
            border="gold"
            value={"Your Text"}
            onAccept={() => undefined}
            type="text"
        />

    ),
};

export const SilverBorder: Story = {
    render: () => (
        <TextInput
            border="silver"
            value={"Your Text"}
            onAccept={() => undefined}
            type="text"
        />

    ),
};