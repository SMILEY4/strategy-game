import {StoryObj} from "@storybook/react";
import React from "react";
import {Button, ButtonProps} from "./Button";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";
import {FaHome, FaSearch} from "react-icons/fa";
import {HBox} from "../layout/hbox/HBox";
import {TextField} from "../textfield/TextField";

const meta = {
    title: "Controls/Button/Primary",
    component: Button,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<ButtonProps & {buttonType: "info" | "warn" | "success" }>
export default meta;


export const Default: Story = {
    args: {
        buttonType: "warn",
        disabled: false,
        circle: false,
    },
    argTypes: {
        buttonType: {
            options: ["info", "success", "warn"],
            control: {type: "select"},
        },
    },
    render: (args) => (
        <DecoratedPanel>
            <div style={{padding: "50px"}}>
                <Button type={args.buttonType} disabled={args.disabled} circle={args.circle}>
                    Button
                </Button>
            </div>
        </DecoratedPanel>
    ),
};

export const Round: Story = {
    render: () => (
        <DecoratedPanel>
            <div style={{padding: "50px"}}>
                <Button circle info>
                        <FaHome style={{width: "100%", height: "100%", display: "block"}}/>
                </Button>
            </div>
        </DecoratedPanel>
    ),
};

export const NextToTextField: Story = {
    render: () => (
        <DecoratedPanel>
            <div style={{padding: "50px"}}>
                <HBox gap_none>
                    <TextField value={""}/>
                    <Button success>
                        <FaSearch style={{width: "100%", height: "100%", display: "block"}}/>
                    </Button>
                </HBox>
            </div>
        </DecoratedPanel>
    ),
};