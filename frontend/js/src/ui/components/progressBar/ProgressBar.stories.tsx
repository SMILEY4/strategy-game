import {StoryObj} from "@storybook/react";
import React from "react";
import {ProgressBar, ProgressBarProps} from "./ProgressBar";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";
import {VBox} from "../layout/vbox/VBox";

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


export const Default: Story = {
    args: {
        progress: 0.7,
    },
    argTypes: {
        progress: {
            control: {type: "range", min: 0, max: 1, step: 0.05},
        },
    },
    render: (args) => (
        <DecoratedPanel>
            <VBox padding_m gap_m>


                <ProgressBar progress={args.progress}>
                    {/*<Text>Progress</Text>*/}
                </ProgressBar>

                <ProgressBar progress={args.progress}/>

                <ProgressBar small progress={args.progress}/>

            </VBox>
        </DecoratedPanel>
    ),
};
