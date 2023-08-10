import {Meta, StoryObj} from "@storybook/react";
import {ButtonPrimary} from "./ButtonPrimary";
import {FiMap} from "react-icons/fi";
import React from "react";

const meta = {
    title: "Controls/Button/Primary",
    component: ButtonPrimary,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ButtonPrimary>;

export default meta;
type Story = StoryObj<typeof ButtonPrimary>;


export const Default: Story = {
    args: {
        disabled: false,
        round: false,
        borderType: "gold",
        children: "Button"
    },
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
    },
};

export const Icon: Story = {
    args: {
        disabled: false,
        round: true,
        borderType: "gold",
        children: <FiMap style={{}}/>
    },
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
    },
};

export const TextWithIcon: Story = {
    args: {
        disabled: false,
        round: false,
        borderType: "gold",
        children:
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem"
            }}>
            <FiMap/>
            Button
        </div>
    },
    argTypes: {
        children: {
            table: {
                disable: true,
            },
        },
    },
};



