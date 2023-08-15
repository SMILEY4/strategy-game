import {StoryObj} from "@storybook/react";
import React from "react";
import {Panel} from "../panel/Panel";
import "./test.less";

const meta = {
    title: "Test",
    component: Element,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<typeof Panel>
export default meta;


export const Default: Story = {
    render: () => (
        <div className="test">
            <div className="test__inner">
                <DummyContent/>
            </div>
        </div>
    ),
};

function DummyContent() {
    return (
        <div style={{
            width: "150px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            Content
        </div>
    );
}
