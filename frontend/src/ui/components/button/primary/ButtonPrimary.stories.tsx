import {StoryObj} from "@storybook/react";
import React from "react";
import {ButtonPrimary} from "./ButtonPrimary";

const meta = {
    title: "Button",
    component: ButtonPrimary,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof ButtonPrimary>
export default meta;


export const Default: Story = {


};