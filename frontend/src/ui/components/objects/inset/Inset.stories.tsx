import {Meta, StoryObj} from "@storybook/react";
import React from "react";
import {Inset} from "./Inset";

const meta = {
    title: "Objects/Inset",
    component: Inset,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof Inset>;

export default meta;
type Story = StoryObj<typeof Inset>;


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