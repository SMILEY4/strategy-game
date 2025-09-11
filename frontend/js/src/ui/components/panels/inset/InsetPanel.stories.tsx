import {StoryObj} from "@storybook/react";
import React from "react";
import {InsetPanel} from "./InsetPanel";
import {DecoratedPanel} from "../decorated/DecoratedPanel";

const meta = {
    title: "Panels/Inset",
    component: InsetPanel,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof InsetPanel>
export default meta;


export const Default: Story = {
    render: () => (
        <DecoratedPanel>
            <InsetPanel>
                <DummyContent/>
            </InsetPanel>
        </DecoratedPanel>
    ),
};


function DummyContent() {
    return (
        <div style={{
            width: "100px",
            height: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
        }}>
            Content
        </div>
    );
}
