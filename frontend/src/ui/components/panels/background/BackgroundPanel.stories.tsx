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


export const Default: Story = {
    render: () => (
        <BackgroundPanel>
            <DummyContent/>
        </BackgroundPanel>
    ),
};


export const Stacked: Story = {
    render: () => (
        <BackgroundPanel>
            <DecoratedPanel red>
                <DecoratedPanel green simpleBorder>
                    <DecoratedPanel blue simpleBorder>
                        <DecoratedPanel paper simpleBorder>
                            <DummyContent/>
                        </DecoratedPanel>
                    </DecoratedPanel>
                </DecoratedPanel>
            </DecoratedPanel>
        </BackgroundPanel>
    ),
};

function DummyContent() {
    return (
        <div style={{
            width: "150px",
            height: "150px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            Content
        </div>
    );
}
