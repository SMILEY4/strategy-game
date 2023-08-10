import {Meta, StoryObj} from "@storybook/react";
import {Depression} from "./Depression";
import React from "react";

const meta = {
    title: "Objects/Depression",
    component: Depression,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Depression>;

export default meta;
type Story = StoryObj<typeof Depression>;


export const Default: Story = {
    args: {
        children: <div style={{
            width: "100px",
            height: "30px"
        }}/>
    },
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
    },
};