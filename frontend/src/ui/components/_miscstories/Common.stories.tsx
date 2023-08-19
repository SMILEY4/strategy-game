import {StoryObj} from "@storybook/react";
import React from "react";
import "./commonStories.scoped.less";

const meta = {
    title: "Static/Common",
    parameters: {
        layout: "centered",
    },
    tags: [],
    argTypes: {},
};
type Story = StoryObj<{}>
export default meta;


export const Spacing: Story = {
    render: () => (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
        }}>
            <div className="hbar spacing-xs"/>
            <div className="hbar spacing-s"/>
            <div className="hbar spacing-m"/>
            <div className="hbar spacing-l"/>
            <div className="hbar spacing-xl"/>
            <div className="hbar spacing-xxl"/>
        </div>
    ),
};

export const Font: Story = {
    render: () => (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "64px",
        }}>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
            }}>
                <div className="font font--1 size-xxl">The five boxing wizards jump quickly.</div>
                <div className="font font--1 size-xl">The five boxing wizards jump quickly.</div>
                <div className="font font--1 size-l">The five boxing wizards jump quickly.</div>
                <div className="font font--1 size-m">The five boxing wizards jump quickly.</div>
                <div className="font font--1 size-s">The five boxing wizards jump quickly.</div>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
            }}>
                <div className="font font--2 size-xxl">The five boxing wizards jump quickly.</div>
                <div className="font font--2 size-xl">The five boxing wizards jump quickly.</div>
                <div className="font font--2 size-l">The five boxing wizards jump quickly.</div>
                <div className="font font--2 size-m">The five boxing wizards jump quickly.</div>
                <div className="font font--2 size-s">The five boxing wizards jump quickly.</div>
            </div>
        </div>
    ),
};