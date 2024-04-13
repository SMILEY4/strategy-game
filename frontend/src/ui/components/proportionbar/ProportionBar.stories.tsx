import {StoryObj} from "@storybook/react";
import React from "react";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";
import {ProportionBar, ProportionBarProps} from "./ProportionBar";

const meta = {
    title: "Controls/ProportionBar",
    component: ProportionBar,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<ProportionBarProps>
export default meta;

export const Default: Story = {
    args: {},
    argTypes: {},
    render: (args) => (
        <DecoratedPanel red>
            <div style={{width: "200px"}}>
            <ProportionBar
                color={"green"}
                totalValue={100}
                entries={[
                    { name: "Different Player", value: 25, color: "green"},
                    { name: "Player A", value: 60, color: "red"},
                    { name: "Third Player", value: 15, color: "blue"},
                ]}
            />
            </div>
        </DecoratedPanel>
    ),
};
