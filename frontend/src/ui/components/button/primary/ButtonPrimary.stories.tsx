import {StoryObj} from "@storybook/react";
import React from "react";
import {ButtonPrimary, ButtonPrimaryColor, ButtonPrimaryProps} from "./ButtonPrimary";
import {DecoratedPanel, DecoratedPanelColor} from "../../panels/decorated/DecoratedPanel";
import {FaHome, FaSearch} from "react-icons/fa";
import {HBox} from "../../layout/hbox/HBox";
import {TextField} from "../../textfield/TextField";

const meta = {
    title: "Controls/Button/Primary",
    component: ButtonPrimary,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<ButtonPrimaryProps & { panelColor: DecoratedPanelColor, buttonColor: ButtonPrimaryColor }>
export default meta;


export const Default: Story = {
    args: {
        panelColor: "red",
        buttonColor: "red",
        disabled: false,
        round: false,
    },
    argTypes: {
        panelColor: {
            options: ["red", "green", "blue", "paper"],
            control: {type: "select"},
        },
        buttonColor: {
            options: ["red", "green", "blue"],
            control: {type: "select"},
        },
    },
    render: (args) => (
        <DecoratedPanel color={args.panelColor}>
            <div style={{padding: "50px"}}>
                <ButtonPrimary color={args.buttonColor} disabled={args.disabled} round={args.round}>
                    Button
                </ButtonPrimary>
            </div>
        </DecoratedPanel>
    ),
};

export const Round: Story = {
    render: () => (
        <DecoratedPanel red>
            <div style={{padding: "50px"}}>
                <ButtonPrimary round blue>
                        <FaHome style={{width: "100%", height: "100%", display: "block"}}/>
                </ButtonPrimary>
            </div>
        </DecoratedPanel>
    ),
};

export const NextToTextField: Story = {
    render: () => (
        <DecoratedPanel red>
            <div style={{padding: "50px"}}>
                <HBox gap_none>
                    <TextField value={""}/>
                    <ButtonPrimary green>
                        <FaSearch style={{width: "100%", height: "100%", display: "block"}}/>
                    </ButtonPrimary>
                </HBox>
            </div>
        </DecoratedPanel>
    ),
};