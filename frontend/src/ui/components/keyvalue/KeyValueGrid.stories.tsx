import {StoryObj} from "@storybook/react";
import React from "react";
import {DecoratedPanel} from "../panels/decorated/DecoratedPanel";
import {KeyValueGrid, KeyValueGridProps} from "./KeyValueGrid";

const meta = {
    title: "Layout/Key-Value-Grid",
    component: KeyValueGrid,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<KeyValueGridProps & { width: "thin" | "auto" | "wide" }>
export default meta;


export const Default: Story = {
    args: {
        width: "auto",
    },
    argTypes: {
        width: {
            options: ["thin", "auto", "wide"],
            control: {type: "select"},
        },
    },
    render: (args) => (
        <DecoratedPanel red>
            <div style={{
                width: args.width === "thin" ? "150px" : (args.width === "wide" ? "600px" : undefined),
                maxWidth: args.width === "thin" ? "150px" : (args.width === "wide" ? "600px" : undefined),
                padding: "50px",
                boxSizing: "border-box",
                border: "1px solid rgba(255, 255, 255, 20%)"
            }}>

                <KeyValueGrid>
                    <div>Key 1</div>
                    <div>Value 1</div>

                    <div>Key 2</div>
                    <div>Value 2</div>

                    <div>Key 3</div>
                    <div>Value 3</div>

                    <div>Key 4</div>
                    <div>Value 4</div>
                </KeyValueGrid>

            </div>
        </DecoratedPanel>
    ),
};