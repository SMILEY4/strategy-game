import {StoryObj} from "@storybook/react";
import React from "react";
import {TextField, TextFieldProps} from "./TextField";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";

const meta = {
    title: "Controls/Input/TextField",
    component: TextField,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<TextFieldProps>
export default meta;


export const Default: Story = {
    args: {},
    argTypes: {
        value: {
            control: {type: "text"},
        },
    },
    render: (args) => (
        <DecoratedPanel ornament>
            <div style={{padding: "50px"}}>
                <TextField value={args.value} placeholder="Placeholder"/>
            </div>
        </DecoratedPanel>
    ),
};
