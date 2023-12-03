import {StoryObj} from "@storybook/react";
import React from "react";
import {DecoratedPanel, DecoratedPanelColor} from "../panels/decorated/DecoratedPanel";
import {EnrichedText, EnrichedTextBlockProps} from "./EnrichedText";
import {Text} from "../text/Text";
import {ETNumber} from "./elements/ETNumber";
import {VBox} from "../layout/vbox/VBox";
import {Spacer} from "../spacer/Spacer";
import {ETTooltip} from "./elements/ETTooltip";
import {ETLink} from "./elements/ETLink";
import {ETText} from "./elements/ETText";

const meta = {
    title: "Static/EnrichedText",
    component: Text,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
};
type Story = StoryObj<EnrichedTextBlockProps & { panelColor: DecoratedPanelColor }>
export default meta;


export const Default: Story = {
    render: () => (
        <DecoratedPanel red>
            <div style={{padding: "50px"}}>
                <VBox gap_none>

                    <EnrichedText>
                        Hello World!
                    </EnrichedText>

                    <Spacer size={"s"}/>

                    <EnrichedText>
                        Highlighted words: Some words can be <ETText pos>positive</ETText> and some <ETText neg>negative</ETText>.
                    </EnrichedText>

                    <Spacer size={"s"}/>

                    <EnrichedText>
                        Number with types: <ETNumber typeNone>{4}</ETNumber> default, <ETNumber pos>{4}</ETNumber> added, <ETNumber neg>{4}</ETNumber> removed, <ETNumber info>{4}</ETNumber> info
                    </EnrichedText>
                    <EnrichedText>
                        Numbers with auto types: <ETNumber>{-3}</ETNumber>, <ETNumber>{0}</ETNumber>, <ETNumber>{5}</ETNumber>
                    </EnrichedText>
                    <EnrichedText>
                        Numbers with inverted auto types: <ETNumber typeAutoInv>{-3}</ETNumber>, <ETNumber typeAutoInv>{0}</ETNumber>, <ETNumber typeAutoInv>{5}</ETNumber>
                    </EnrichedText>
                    <EnrichedText>
                        Number with rounding: <ETNumber>{1.234567}</ETNumber>, <ETNumber decPlaces={2}>{1.234567}</ETNumber>, <ETNumber decPlaces={1}>{1.234567}</ETNumber>, <ETNumber decPlaces={0}>{1.234567}</ETNumber>
                    </EnrichedText>

                    <Spacer size={"s"}/>

                    <EnrichedText>
                        Tooltips:  some number <ETTooltip content={"some value"}><ETNumber>{42}</ETNumber></ETTooltip> and some <ETTooltip content={"some text"}>text</ETTooltip> and some <ETTooltip content={"some text"}><ETText pos>highlighted text</ETText></ETTooltip>
                    </EnrichedText>

                    <Spacer size={"s"}/>

                    <EnrichedText>
                        Links:  some number <ETLink onClick={() => alert("click")}><ETNumber>{42}</ETNumber></ETLink> and some <ETLink onClick={() => alert("click")}>text</ETLink> and some <ETLink onClick={() => alert("click")}><ETText pos>highlighted text</ETText></ETLink>
                    </EnrichedText>

                </VBox>
            </div>
        </DecoratedPanel>
    ),
};