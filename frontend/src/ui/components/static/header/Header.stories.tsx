import {StoryObj} from "@storybook/react";
import React from "react";
import {DecoratedPanel, DecoratedPanelColor} from "../../panels/decorated/DecoratedPanel";
import {Header, Header1, Header2, Header3, Header4, HeaderProps} from "./Header";

const meta = {
    title: "Static/Header",
    component: Header,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<HeaderProps & { panelColor: DecoratedPanelColor }>
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
        level: {
            options: [1, 2, 3, 4],
            control: {type: "select"},
        },
    },
    render: (args) => (
        <DecoratedPanel color={args.panelColor}>
            <div style={{padding: "50px"}}>
                <Header level={args.level}>Header</Header>
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
                <Header1>Header 1</Header1>
                <Header2>Header 2</Header2>
                <Header3>Header 3</Header3>
                <Header4>Header 4</Header4>
            </div>
        </DecoratedPanel>
    ),
};