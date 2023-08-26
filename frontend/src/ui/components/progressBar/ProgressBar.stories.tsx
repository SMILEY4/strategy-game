import {StoryObj} from "@storybook/react";
import React from "react";
import {ProgressBar, ProgressBarProps} from "./ProgressBar";
import {Text} from "../text/Text";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";

const meta = {
    title: "Controls/ProgressBar",
    component: ProgressBar,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<ProgressBarProps>
export default meta;

0
export const Default: Story = {
    render: () => (
        <DecoratedPanel red>
        <ProgressBar progress={0.9}>
            <Text relative>Progress</Text>
        </ProgressBar>
        </DecoratedPanel>
    ),
};
