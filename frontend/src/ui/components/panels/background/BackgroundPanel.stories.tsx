import {StoryObj} from "@storybook/react";
import React from "react";
import {BackgroundPanel} from "./BackgroundPanel";
import {DecoratedPanel} from "../decorated/DecoratedPanel";

const meta = {
    title: "Panels/Background",
    component: BackgroundPanel,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof BackgroundPanel>
export default meta;


export const Gradient: Story = {
    render: () => (
        <DummyContainer>
            <BackgroundPanel>
                <DummyContent/>
            </BackgroundPanel>
        </DummyContainer>
    ),
};

export const Image: Story = {
    render: () => (
        <DummyContainer>
            <BackgroundPanel image="/images/image_1.png">
                <DummyContent/>
            </BackgroundPanel>
        </DummyContainer>
    ),
};

function DummyContainer(props: { children?: any}) {
    return (
        <div style={{
            width: "400px",
            height: "300px",
            border: "1px solid red",
        }}>
            {props.children}
        </div>
    );
}

function DummyContent() {
    return (
        <div style={{
            width: "150px",
            height: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "gray",
            border: "1px solid red",
        }}>
            Content
        </div>
    );
}
