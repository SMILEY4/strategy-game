import {StoryObj} from "@storybook/react";
import React from "react";
import {DecoratedPanel, DecoratedPanelColor} from "../panels/decorated/DecoratedPanel";
import {Text, TextProps} from "./Text";

const meta = {
    title: "Static/Text",
    component: Text,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<TextProps & { panelColor: DecoratedPanelColor }>
export default meta;


export const Default: Story = {
    args: {
        panelColor: "red",
    },
    argTypes: {
        panelColor: {
            options: ["red", "green", "blue", "paper"],
            control: {type: "select"},
        },
    },
    render: (args) => (
        <DecoratedPanel color={args.panelColor}>
            <div style={{padding: "50px"}}>
                <Text
                    type={args.type}
                    strikethrough={args.strikethrough}
                    onLight={args.onLight}
                >
                    Hello World!
                </Text>
            </div>
        </DecoratedPanel>
    ),
};


export const Stacked: Story = {
    args: {
        panelColor: "red",
    },
    argTypes: {
        panelColor: {
            options: ["red", "green", "blue", "paper"],
            control: {type: "select"},
        },
    },
    render: (args) => (
        <DecoratedPanel color={args.panelColor}>
            <div style={{
                padding: "50px",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                justifyContent: "center",
                alignItems: "start",
            }}>
                <Text>Default</Text>
                <Text type="secondary">Secondary</Text>
                <Text type="positive">Positive</Text>
                <Text type="negative">Negative</Text>
            </div>
        </DecoratedPanel>
    ),
};