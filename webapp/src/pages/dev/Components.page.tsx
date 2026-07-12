import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {Icon} from "@modules/uicomponents/icon/Icon.tsx";
import {Checkbox} from "@modules/uicomponents/controls/checkbox/Checkbox.tsx";
import {TextField} from "@modules/uicomponents/controls/textfield/TextField.tsx";
import type {ReactElement} from "react";
import "./components.page.less";
import {Panel} from "@/modules/uicomponents/panel/Panel";

export function ComponentsPage(): ReactElement {

    return (
        <VerticalLayout className="components-page" center spacing3xl padding2xl fillWidth>

            {/*==========  PANELS (parchment) ==========*/}

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Parchment edge="straight" border="none" style={{width: 300, height: 200}}/>
                <Panel.Parchment edge="simplified" border="none" style={{width: 300, height: 200}}/>
                <Panel.Parchment edge="detailed" border="none" style={{width: 300, height: 200}}/>
            </HorizontalLayout>

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Parchment edge="straight" border="ornamental" style={{width: 300, height: 200}}/>
                <Panel.Parchment edge="simplified" border="ornamental" style={{width: 300, height: 200}}/>
                <Panel.Parchment edge="detailed" border="ornamental" style={{width: 300, height: 200}}/>
            </HorizontalLayout>

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Parchment edge="straight" border="metal" style={{width: 300, height: 200}}/>
            </HorizontalLayout>

            {/*==========  PANELS (decorated) ==========*/}

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated pattern="none" border="none" style={{width: 300, height: 200}}/>
                <Panel.Decorated pattern="paper" border="none" style={{width: 300, height: 200}}/>
                <Panel.Decorated pattern="ornament" border="none" style={{width: 300, height: 200}}/>
            </HorizontalLayout>

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated pattern="none" border="metal" style={{width: 300, height: 200}}/>
                <Panel.Decorated pattern="paper" border="metal" style={{width: 300, height: 200}}/>
                <Panel.Decorated pattern="ornament" border="metal" style={{width: 300, height: 200}}/>
            </HorizontalLayout>

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated pattern="none" border="line" style={{width: 300, height: 200}}/>
                <Panel.Decorated pattern="paper" border="line" style={{width: 300, height: 200}}/>
                <Panel.Decorated pattern="ornament" border="line" style={{width: 300, height: 200}}/>
            </HorizontalLayout>

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated pattern="none" border="ornamental" style={{width: 300, height: 200}}/>
                <Panel.Decorated pattern="paper" border="ornamental" style={{width: 300, height: 200}}/>
                <Panel.Decorated pattern="ornament" border="ornamental" style={{width: 300, height: 200}}/>
            </HorizontalLayout>

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated pattern="none" border="metal-ornament" style={{width: 300, height: 200}}/>
                <Panel.Decorated pattern="paper" border="metal-ornament" style={{width: 300, height: 200}}/>
                <Panel.Decorated pattern="ornament" border="metal-ornament" style={{width: 300, height: 200}}/>
            </HorizontalLayout>


            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated variant="neutral" style={{width: 150, height: 100}}/>
                <Panel.Decorated variant="blue" style={{width: 150, height: 100}}/>
                <Panel.Decorated variant="red" style={{width: 150, height: 100}}/>
            </HorizontalLayout>
            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated variant="green" style={{width: 150, height: 100}}/>
                <Panel.Decorated variant="purple" style={{width: 150, height: 100}}/>
                <Panel.Decorated variant="yellow" style={{width: 150, height: 100}}/>
            </HorizontalLayout>
            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated variant="orange" style={{width: 150, height: 100}}/>
                <Panel.Decorated variant="teal" style={{width: 150, height: 100}}/>
                <Panel.Decorated variant="bronze" style={{width: 150, height: 100}}/>
            </HorizontalLayout>


            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated overlay={{ color: "red", direction: "top" }} style={{width: 300, height: 200}}/>
                <Panel.Decorated overlay={{ color: "cyan", direction: "left" }} style={{width: 300, height: 200}}/>
                <Panel.Decorated overlay={{ color: "darkGreen", direction: "fill" }} style={{width: 300, height: 200}}/>
            </HorizontalLayout>

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated overlay={{ url: "/cobblestone.jpg", direction: "top" }} style={{width: 300, height: 200}}/>
                <Panel.Decorated overlay={{ url: "/cobblestone.jpg", direction: "left" }} style={{width: 300, height: 200}}/>
                <Panel.Decorated overlay={{ url: "/cobblestone.jpg", direction: "fill" }} style={{width: 300, height: 200}}/>
            </HorizontalLayout>


            <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                <Panel.Decorated>
                    <VerticalLayout paddingL spacingS horizontalLeft>
                        <Button>Click Me!</Button>
                        <Checkbox>Select Me</Checkbox>
                        <TextField.Root>
                            <TextField.Control>
                                <TextField.Input placeholder="Text Input"/>
                            </TextField.Control>
                        </TextField.Root>
                    </VerticalLayout>
                </Panel.Decorated>
            </HorizontalLayout>


            {/*==========  BUTTON ==========*/}

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>

                <VerticalLayout spacingS verticalStart horizontalCenter>
                    <Button size="s">Click Me!</Button>
                    <Button size="m">Click Me!</Button>
                    <Button size="l">Click Me!</Button>
                </VerticalLayout>

                <VerticalLayout spacingS verticalStart horizontalCenter>
                    <Button shape="box">Click Me!</Button>
                    <Button shape="pill">Click Me!</Button>
                    <Button shape="square"><Icon.Cross/></Button>
                    <Button shape="circle"><Icon.Cross/></Button>
                </VerticalLayout>

                <VerticalLayout spacingS verticalStart horizontalCenter>
                    <Button disabled={false}>Enabled</Button>
                    <Button disabled={true}>Disabled</Button>
                </VerticalLayout>

                <VerticalLayout spacingS verticalStart horizontalCenter>
                    <Button intent="neutral">Neutral</Button>
                    <Button intent="success">Success</Button>
                    <Button intent="danger">Danger</Button>
                </VerticalLayout>

                <VerticalLayout spacingS verticalStart horizontalCenter>
                    <Button size="s">Settings<Icon.Gear/></Button>
                    <Button size="m">Settings<Icon.Gear/></Button>
                    <Button size="l">Settings<Icon.Gear/></Button>
                </VerticalLayout>

            </HorizontalLayout>

            {/*==========  CHECKBOX ==========*/}

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>

                <VerticalLayout spacingS verticalStart horizontalCenter>
                    <Checkbox size="s">Select Me</Checkbox>
                    <Checkbox size="m">Select Me</Checkbox>
                    <Checkbox size="l">Select Me</Checkbox>
                </VerticalLayout>

                <VerticalLayout spacingS verticalStart horizontalCenter>
                    <Checkbox disabled={false}>Enabled</Checkbox>
                    <Checkbox disabled={true}>Disabled</Checkbox>
                </VerticalLayout>


            </HorizontalLayout>

            {/*==========  TEXTFIELD ==========*/}

            <HorizontalLayout spacing3xl horizontalStart verticalCenter>

                <VerticalLayout spacingS verticalStart horizontalCenter>

                    <TextField.Root>
                        <TextField.Control sizeS>
                            <TextField.Input/>
                        </TextField.Control>
                    </TextField.Root>

                    <TextField.Root>
                        <TextField.Control sizeM>
                            <TextField.Input/>
                        </TextField.Control>
                    </TextField.Root>

                    <TextField.Root>
                        <TextField.Control sizeL>
                            <TextField.Input/>
                        </TextField.Control>
                    </TextField.Root>

                </VerticalLayout>

                <VerticalLayout spacingS verticalStart horizontalCenter>

                    <TextField.Root>
                        <TextField.Control box>
                            <TextField.Input/>
                        </TextField.Control>
                    </TextField.Root>

                    <TextField.Root>
                        <TextField.Control pill>
                            <TextField.Input/>
                        </TextField.Control>
                    </TextField.Root>

                </VerticalLayout>

                <VerticalLayout spacingS verticalStart horizontalCenter>

                    <TextField.Root>
                        <TextField.Control>
                            <TextField.Input disabled={false}/>
                        </TextField.Control>
                    </TextField.Root>

                    <TextField.Root>
                        <TextField.Control>
                            <TextField.Input disabled={true}/>
                        </TextField.Control>
                    </TextField.Root>

                </VerticalLayout>

                <VerticalLayout spacingS verticalStart horizontalCenter>

                    <TextField.Root>
                        <TextField.Control sizeS>
                            <TextField.Input/>
                            <TextField.ShowPassword/>
                        </TextField.Control>
                    </TextField.Root>

                    <TextField.Root>
                        <TextField.Control sizeM>
                            <TextField.Input/>
                            <TextField.ShowPassword/>
                        </TextField.Control>
                    </TextField.Root>

                    <TextField.Root>
                        <TextField.Control sizeL>
                            <TextField.Input/>
                            <TextField.ShowPassword/>
                        </TextField.Control>
                    </TextField.Root>

                </VerticalLayout>

                <VerticalLayout spacingS verticalStart horizontalCenter>

                    <TextField.Root>
                        <TextField.Control>
                            <TextField.Input placeholder="Placeholder"/>
                        </TextField.Control>
                    </TextField.Root>

                    <TextField.Root>
                        <TextField.Control>
                            <TextField.Input/>
                            <Icon.Gear/>
                        </TextField.Control>
                    </TextField.Root>

                    <TextField.Root>
                        <TextField.Control>
                            <Icon.Gear/>
                            <TextField.Input/>
                        </TextField.Control>
                    </TextField.Root>

                    <TextField.Root>
                        <TextField.Control pill>
                            <Icon.Gear/>
                            <TextField.Input/>
                        </TextField.Control>
                    </TextField.Root>

                    <TextField.Root>
                        <TextField.Label>Some Label</TextField.Label>
                        <TextField.Control>
                            <TextField.Input/>
                        </TextField.Control>
                        <TextField.Message>This is a longer message below a text field input element.</TextField.Message>
                    </TextField.Root>

                </VerticalLayout>

            </HorizontalLayout>

        </VerticalLayout>
    );

}