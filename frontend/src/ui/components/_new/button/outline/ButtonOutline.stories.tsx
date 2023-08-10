import {Meta, StoryObj} from "@storybook/react";
import {FiMap} from "react-icons/fi";
import React from "react";
import {ButtonOutline} from "./ButtonOutline";

const meta = {
    title: "Misc/ButtonOutline",
    component: ButtonOutline,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof ButtonOutline>;

export default meta;
type Story = StoryObj<typeof ButtonOutline>;


export const Default: Story = {
    args: {
        disabled: false,
        round: false,
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
