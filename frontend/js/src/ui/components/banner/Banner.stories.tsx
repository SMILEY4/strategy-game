import {StoryObj} from "@storybook/react";
import React from "react";
import {Banner} from "./Banner";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";
import {VBox} from "../layout/vbox/VBox";
import {Button} from "../button/Button";
import {RxActivityLog, RxEyeOpen} from "react-icons/rx";

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
    args: {
        title: "Title",
        subtitle: "Subtitle",
        spaceAbove: true
    },
    // argTypes: {
    //     title: {
    //         control: {type: "text"},
    //     },
    //     subtitle: {
    //         control: {type: "text"},
    //     },
    //     spaceAbove: {
    //         control: {type: "boolean"},
    //     }
    // },
    render: (args) => (
        <DecoratedPanel style={{width: "300px"}}>
            <VBox fullSize>
                <Banner
                    spaceAbove={args.spaceAbove}
                    title={args.title}
                    subtitle={args.subtitle}
                >
                    <Button circle small><RxEyeOpen/></Button>
                    <Button circle small><RxActivityLog/></Button>
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
