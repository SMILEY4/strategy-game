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

0;
export const Default: Story = {
    args: {
        progress: 0.7,
    },
    argTypes: {
        progress: {
            options: ["red", "green", "blue", "paper"],
            control: {type: "range", min: 0, max: 1, step: 0.05},
        },
    },
    render: (args) => (
        <DecoratedPanel red>
            <ProgressBar progress={args.progress}>
                <Text relative>Progress</Text>
            </ProgressBar>
        </DecoratedPanel>
    ),
};
