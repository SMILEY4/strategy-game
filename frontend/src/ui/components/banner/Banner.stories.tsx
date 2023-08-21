import {StoryObj} from "@storybook/react";
import React from "react";
import {Banner} from "./Banner";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";
import {Header1} from "../header/Header";
import {VBox} from "../layout/vbox/VBox";

const meta = {
    title: "Static/Banner",
    component: Banner,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof Banner>
export default meta;

export const Default: Story = {
    render: () => (
        <DecoratedPanel red noPadding>
            <VBox fillParent top stretch>
                <Banner>
                    <Header1 centered>Banner</Header1>
                </Banner>
                <DummyContent width="100%"/>
            </VBox>
        </DecoratedPanel>
    ),
};

export const SpaceAbove: Story = {
    render: () => (
        <DecoratedPanel red noPadding>
            <VBox fillParent top stretch>
                <Banner spaceAbove>
                    <Header1 centered>Banner</Header1>
                </Banner>
                <DummyContent width="100%"/>
            </VBox>
        </DecoratedPanel>
    ),
};


function DummyContent(props: { width?: string, height?: string }) {
    return (
        <div style={{
            width: props.width || "150px",
            height: props.height || "150px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            Content
        </div>
    );
}
