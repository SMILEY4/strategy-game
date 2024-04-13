import {StoryObj} from "@storybook/react";
import React from "react";
import {TextField, TextFieldProps} from "./TextField";
import {DecoratedPanel, DecoratedPanelColor} from "../panels/decorated/DecoratedPanel";

const meta = {
    title: "Controls/Input/TextField",
    component: TextField,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<TextFieldProps & { panelColor: DecoratedPanelColor }>
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
        color: {
            options: ["red", "green", "blue", "paper"],
            control: {type: "select"},
        },
        value: {
            control: {type: "text"},
        },
    },
    render: (args) => (
        <DecoratedPanel color={args.panelColor}>
            <div style={{padding: "50px"}}>
                <TextField color={args.color} value={args.value} placeholder="Placeholder"/>
            </div>
        </DecoratedPanel>
    ),
};
