import {StoryObj} from "@storybook/react";
import React from "react";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";
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
type Story = StoryObj<TextProps>
export default meta;


export const Default: Story = {
    render: (args) => (
        <DecoratedPanel>
            <div style={{padding: "50px"}}>
                <Text
                    type={args.type}
                    strikethrough={args.strikethrough}
                >
                    Hello World!
                </Text>
            </div>
        </DecoratedPanel>
    ),
};


export const Stacked: Story = {
    render: (args) => (
        <DecoratedPanel>
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