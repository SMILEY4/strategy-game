import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {Icon} from "@modules/uicomponents/icon/Icon.tsx";
import {Checkbox} from "@modules/uicomponents/controls/checkbox/Checkbox.tsx";
import {TextField} from "@modules/uicomponents/controls/textfield/TextField.tsx";
import {type ReactElement, useState} from "react";
import "./components.page.less";
import {Panel} from "@/modules/uicomponents/panel/Panel";
import {Txt} from "@modules/uicomponents/text/Txt.tsx";
import {Separator} from "@modules/uicomponents/separator/Separator.tsx";
import {Selectbox} from "@modules/uicomponents/controls/selectbox/Selectbox.ts";
import {WindowStack} from "@modules/uicomponents/window/WindowStack.tsx";
import {openWindow, useWindowInteractions} from "@modules/uicomponents/window/useWindow.ts";
import {ANCHOR_CENTER_POINT} from "@modules/uicomponents/window/window-system.ts";
import {SimpleWindow} from "@modules/uicomponents/window/simple/SimpleWindow.tsx";

type LanguageItem = {
    key: string,
    display: string,
    flag: string
}

export function ComponentsPage(): ReactElement {

    const languages: LanguageItem[] = [
        {
            key: "german",
            display: "German",
            flag: "🇩🇪",
        },
        {
            key: "french",
            display: "French",
            flag: "🇫🇷",
        },
        {
            key: "english",
            display: "English",
            flag: "🇺🇸",
        },
        {
            key: "italian",
            display: "Italian",
            flag: "🇮🇹",
        },
        {
            key: "dutch",
            display: "Dutch",
            flag: "🇳🇱",
        },
        {
            key: "norwegian",
            display: "Norwegian",
            flag: "🇳🇴",
        },
        {
            key: "swedish",
            display: "Swedish",
            flag: "🇸🇪",
        },
        {
            key: "spanish",
            display: "Spanish",
            flag: "🇪🇸",
        },
    ];

    const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

    return (
        <VerticalLayout className="components-page" center spacing3xl padding2xl fillWidth>

            {/*==========  TEXT ==========*/}

            <>

                <VerticalLayout>
                    <Txt.Heading h1>Text</Txt.Heading>
                    <Txt.Body>
                        Text with extra features. Headers, single lines and paragraphs. Can contain strings, formatted numbers, icons and
                        clickable sections.
                    </Txt.Body>
                </VerticalLayout>

                <HorizontalLayout spacing3xl horizontalStart verticalCenter>

                    <VerticalLayout spacingS verticalStart horizontalCenter>
                        <Txt.Heading level={1}>
                            <Txt.String>Heading</Txt.String>
                            <Txt.Number>{1}</Txt.Number>
                        </Txt.Heading>
                        <Txt.Heading level={2}>
                            <Txt.String>Heading</Txt.String>
                            <Txt.Number>{2}</Txt.Number>
                        </Txt.Heading>
                        <Txt.Heading level={3}>
                            <Txt.String>Heading</Txt.String>
                            <Txt.Number>{3}</Txt.Number>
                        </Txt.Heading>
                        <Txt.Heading level={4}>
                            <Txt.String>Heading</Txt.String>
                            <Txt.Number>{4}</Txt.Number>
                        </Txt.Heading>
                        <Txt.Heading level={5}>
                            <Txt.String>Heading</Txt.String>
                            <Txt.Number>{5}</Txt.Number>
                        </Txt.Heading>
                        <Txt.Heading level={6}>
                            <Txt.String>Heading</Txt.String>
                            <Txt.Number>{6}</Txt.Number>
                        </Txt.Heading>
                        <Txt.Heading level={1}>
                            <Txt.String>Heading with</Txt.String>
                            <Txt.Icon><Icon.Eye/></Txt.Icon>
                            <Txt.String>Icon</Txt.String>
                        </Txt.Heading>
                    </VerticalLayout>

                    <VerticalLayout spacingS verticalStart horizontalCenter>
                        <div style={{
                            border: "1px solid gray",
                            width: 200,
                            maxWidth: 200,
                        }}>
                            <Txt.Line>
                                <Txt.String>Some line that</Txt.String>
                                <Txt.String>continues on</Txt.String>
                                <Txt.String>for quite some length.</Txt.String>
                            </Txt.Line>
                        </div>
                        <div style={{
                            border: "1px solid gray",
                            width: 200,
                            maxWidth: 200,
                        }}>
                            <Txt.Line>
                                <Txt.String>Some line that</Txt.String>
                                <Txt.String>ends here</Txt.String>
                            </Txt.Line>
                        </div>
                    </VerticalLayout>

                    <VerticalLayout spacingS verticalStart horizontalCenter>
                        <div style={{
                            border: "1px solid gray",
                            width: 200,
                            maxWidth: 200,
                        }}>
                            <Txt.Body>
                                <Txt.String>Some paragraph that</Txt.String>
                                <Txt.String>continues on</Txt.String>
                                <Txt.String>for quite some length.</Txt.String>
                            </Txt.Body>
                        </div>
                        <div style={{
                            border: "1px solid gray",
                            width: 200,
                            maxWidth: 200,
                        }}>
                            <Txt.Body>
                                <Txt.String>Some paragraph that</Txt.String>
                                <Txt.String>ends here</Txt.String>
                            </Txt.Body>
                        </div>
                    </VerticalLayout>

                </HorizontalLayout>

                <HorizontalLayout spacing3xl horizontalStart verticalCenter>

                    <div style={{
                        border: "1px solid gray",
                        width: 200,
                        resize: "both",
                        maxHeight: "fit-content",
                        maxWidth: "fit-content",
                        overflow: "auto",
                    }}>
                        <Txt.Heading level={5}>Complex Text on Dark</Txt.Heading>
                        <Txt.Body>
                            <Txt.String>Some paragraph that includes formatted numbers for example</Txt.String>
                            <Txt.Number decimals={2}>{42.12345}</Txt.Number>
                            <Txt.String>or as percentages</Txt.String>
                            <Txt.Number decimals={1} percentage>{0.7512345}</Txt.Number>
                            <Txt.String>and optionally with a forced sign:</Txt.String>
                            <Txt.Number forceSign colored>{14}</Txt.Number>
                            <Txt.Number forceSign colored>{-24}</Txt.Number>
                            <Txt.String>. Text can also include icons</Txt.String>
                            <Txt.Icon><Icon.TrashCan/></Txt.Icon>
                            <Txt.String>inline in the paragraph.</Txt.String>
                            <Txt.String>One can even make.</Txt.String>
                            <Txt.Clickable onClick={() => console.log("Clicked the text")}>
                                <Txt.String>"some parts ("</Txt.String>
                                <Txt.Icon><Icon.Eye/></Txt.Icon>
                                <Txt.Number percentage>{0.99}</Txt.Number>
                                <Txt.String>) clickable!</Txt.String>
                            </Txt.Clickable>
                            <Txt.String>Awesome right?</Txt.String>
                        </Txt.Body>
                    </div>

                    <div style={{
                        border: "1px solid gray",
                        width: 200,
                        resize: "both",
                        maxHeight: "fit-content",
                        maxWidth: "fit-content",
                        overflow: "auto",
                        backgroundColor: "lightgrey",
                    }}>
                        <Txt.Heading level={5} light>Complex Text on Light</Txt.Heading>
                        <Txt.Body light>
                            <Txt.String>Some paragraph that includes formatted numbers for example</Txt.String>
                            <Txt.Number decimals={2}>{42.12345}</Txt.Number>
                            <Txt.String>or as percentages</Txt.String>
                            <Txt.Number decimals={1} percentage>{0.7512345}</Txt.Number>
                            <Txt.String>and optionally with a forced sign:</Txt.String>
                            <Txt.Number forceSign colored>{14}</Txt.Number>
                            <Txt.Number forceSign colored>{-24}</Txt.Number>
                            <Txt.String>. Text can also include icons</Txt.String>
                            <Txt.Icon><Icon.TrashCan/></Txt.Icon>
                            <Txt.String>inline in the paragraph.</Txt.String>
                            <Txt.String>One can even make.</Txt.String>
                            <Txt.Clickable onClick={() => console.log("Clicked the text")}>
                                <Txt.String>"some parts ("</Txt.String>
                                <Txt.Icon><Icon.Eye/></Txt.Icon>
                                <Txt.Number percentage>{0.99}</Txt.Number>
                                <Txt.String>) clickable!</Txt.String>
                            </Txt.Clickable>
                            <Txt.String>Awesome right?</Txt.String>
                        </Txt.Body>
                    </div>

                </HorizontalLayout>

            </>


            {/*==========  PANELS (parchment) ==========*/}

            <>

                <VerticalLayout>
                    <Txt.Heading h1>Parchment Panels</Txt.Heading>
                    <Txt.Body>
                        Decorative Parchment panels to display any content inside.
                        Can have different edge variants (straight, wavy and torn)
                        and decorative borders (ornamented or raised metallic).
                    </Txt.Body>
                </VerticalLayout>


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

            </>

            {/*==========  PANELS (decorated) ==========*/}

            <>

                <VerticalLayout>
                    <Txt.Heading h1>Decorative Panels</Txt.Heading>
                    <Txt.Body>
                        Decorative panels to display any content inside.
                        Can have different border variants (no border, raised metallic, line decoration, ornament decoration, and raised
                        metallic ornament),
                        textures (none, paper, ornament pattern) and colors.
                        In addition to this, users can specify additional colors and images to overlay - either as a gradient or a full
                        fill.
                    </Txt.Body>
                </VerticalLayout>

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
                    <Panel.Decorated overlay={{color: "red", direction: "top"}} style={{width: 300, height: 200}}/>
                    <Panel.Decorated overlay={{color: "cyan", direction: "left"}} style={{width: 300, height: 200}}/>
                    <Panel.Decorated overlay={{color: "darkGreen", direction: "fill"}} style={{width: 300, height: 200}}/>
                </HorizontalLayout>

                <HorizontalLayout spacing3xl horizontalStart verticalCenter>
                    <Panel.Decorated overlay={{url: "/cobblestone.jpg", direction: "top"}} style={{width: 300, height: 200}}/>
                    <Panel.Decorated overlay={{url: "/cobblestone.jpg", direction: "left"}} style={{width: 300, height: 200}}/>
                    <Panel.Decorated overlay={{url: "/cobblestone.jpg", direction: "fill"}} style={{width: 300, height: 200}}/>
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

            </>

            {/*==========  SEPARATOR ==========*/}

            <>

                <VerticalLayout>
                    <Txt.Heading h1>Separator</Txt.Heading>
                    <Txt.Body>
                        Separators that quickly add spacing between elements and/or add a decorative line.
                    </Txt.Body>
                </VerticalLayout>


                <HorizontalLayout spacing3xl horizontalStart verticalCenter>

                    <div style={{
                        border: "1px solid gray",
                        width: 200,
                    }}>
                        <Txt.Line><Txt.String>Element Above</Txt.String></Txt.Line>
                        <Separator horizontal line/>
                        <Txt.Line><Txt.String>Element Below</Txt.String></Txt.Line>
                    </div>

                    <div style={{
                        border: "1px solid gray",
                        width: 200,
                        height: 200,
                        display: "flex",
                        flexDirection: "row",
                    }}>
                        <Txt.Line><Txt.String>Left Element</Txt.String></Txt.Line>
                        <Separator vertical line/>
                        <Txt.Line><Txt.String>Right Element</Txt.String></Txt.Line>
                    </div>

                </HorizontalLayout>


            </>

            {/*==========  BUTTON ==========*/}

            <>


                <VerticalLayout>
                    <Txt.Heading h1>Buttons</Txt.Heading>
                    <Txt.Body>
                        Clickable buttons of different sizes, shapes (box, pill, square, circle) and variant. Can also contain icons.
                    </Txt.Body>
                </VerticalLayout>

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
            </>

            {/*==========  CHECKBOX ==========*/}

            <>

                <VerticalLayout>
                    <Txt.Heading h1>Checkbox</Txt.Heading>
                    <Txt.Body>
                        Selectable checkboxes of different sizes.
                    </Txt.Body>
                </VerticalLayout>

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
            </>

            {/*==========  TEXTFIELD ==========*/}

            <>

                <VerticalLayout>
                    <Txt.Heading h1>Text Fields</Txt.Heading>
                    <Txt.Body>
                        Text fields to accept user input. Can be different sizes and shapes (box, pill) and support icons and labels above
                        and below the box.
                    </Txt.Body>
                </VerticalLayout>

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
            </>

            {/*==========  SELECTBOX ==========*/}

            <>

                <VerticalLayout>
                    <Txt.Heading h1>Selectbox</Txt.Heading>
                    <Txt.Body>
                        Choose an option from a list of available options via a drop down menu.
                    </Txt.Body>
                </VerticalLayout>

                <HorizontalLayout spacing3xl horizontalStart verticalCenter>

                    <VerticalLayout spacingS verticalStart horizontalCenter>

                        <Selectbox.Root
                            items={languages}
                            renderItem={(item: LanguageItem) => (
                                <Selectbox.Item key={item.key}>{item.flag + " " + item.display}</Selectbox.Item>
                            )}
                            selectedItem={selectedLanguage}
                            onSelectedItemChange={lang => setSelectedLanguage(languages.find(it => it.key == lang.key)!)}
                        >
                            <Selectbox.Control sizeM stableSize box/>
                            <Selectbox.List/>
                        </Selectbox.Root>

                        <Selectbox.Root
                            items={languages}
                            renderItem={(item: LanguageItem) => (
                                <Selectbox.Item key={item.key}>{item.flag + " " + item.display}</Selectbox.Item>
                            )}
                            selectedItem={selectedLanguage}
                            onSelectedItemChange={lang => setSelectedLanguage(languages.find(it => it.key == lang.key)!)}
                        >
                            <Selectbox.Control sizeM stableSize pill/>
                            <Selectbox.List/>
                        </Selectbox.Root>

                    </VerticalLayout>

                    <VerticalLayout spacingS verticalStart horizontalCenter>

                        <Selectbox.Root
                            items={languages}
                            renderItem={(item: LanguageItem) => (
                                <Selectbox.Item key={item.key}>{item.flag + " " + item.display}</Selectbox.Item>
                            )}
                            selectedItem={selectedLanguage}
                            onSelectedItemChange={lang => setSelectedLanguage(languages.find(it => it.key == lang.key)!)}
                        >
                            <Selectbox.Control sizeS stableSize></Selectbox.Control>
                            <Selectbox.List/>
                        </Selectbox.Root>

                        <Selectbox.Root
                            items={languages}
                            renderItem={(item: LanguageItem) => (
                                <Selectbox.Item key={item.key}>{item.flag + " " + item.display}</Selectbox.Item>
                            )}
                            selectedItem={selectedLanguage}
                            onSelectedItemChange={lang => setSelectedLanguage(languages.find(it => it.key == lang.key)!)}
                        >
                            <Selectbox.Control sizeM stableSize></Selectbox.Control>
                            <Selectbox.List listOffset={0}/>
                        </Selectbox.Root>

                        <Selectbox.Root
                            items={languages}
                            renderItem={(item: LanguageItem) => (
                                <Selectbox.Item key={item.key}>{item.flag + " " + item.display}</Selectbox.Item>
                            )}
                            selectedItem={selectedLanguage}
                            onSelectedItemChange={lang => setSelectedLanguage(languages.find(it => it.key == lang.key)!)}
                        >
                            <Selectbox.Control sizeL stableSize></Selectbox.Control>
                            <Selectbox.List/>
                        </Selectbox.Root>

                    </VerticalLayout>


                    <VerticalLayout spacingS verticalStart horizontalCenter>

                        <Selectbox.Root
                            items={languages}
                            renderItem={(item: LanguageItem) => (
                                <Selectbox.Item key={item.key}>{item.flag + " " + item.display}</Selectbox.Item>
                            )}
                            selectedItem={selectedLanguage}
                            onSelectedItemChange={lang => setSelectedLanguage(languages.find(it => it.key == lang.key)!)}
                        >
                            <Selectbox.Control sizeM stableSize></Selectbox.Control>
                            <Selectbox.List/>
                        </Selectbox.Root>


                    </VerticalLayout>

                </HorizontalLayout>

                <div style={{height: 500}}/>
            </>

            <>

                <VerticalLayout>
                    <Txt.Heading h1>Window</Txt.Heading>
                    <Txt.Body>
                        Draggable, resizable windows.
                    </Txt.Body>
                </VerticalLayout>

                <button onClick={() => {
                    openWindow({
                        anchor: ANCHOR_CENTER_POINT,
                        // preferredWidth: CssValueUtils.px(500),
                        // preferredHeight: CssValueUtils.px(400),
                        // content: (windowId: string) => (<TestWindow windowId={windowId}/>),
                        content: (windowId: string) => {
                            return (
                                <SimpleWindow windowId={windowId} title={"Test Window"} withCloseButton={true}>
                                    Hello Content
                                </SimpleWindow>
                            )
                        }
                    });
                }}>
                    Open window
                </button>

                <WindowStack className="window-stack--showcase"/>

            </>

        </VerticalLayout>
    );

}


function TestWindow(props: { windowId: string }) {

    const {
        resizerProps,
        dragProps,
        refContent,
        closeWindow,
    } = useWindowInteractions(props.windowId);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                color: "black",
            }}
            ref={refContent}
        >


            <div
                {...dragProps}
                style={{
                    width: "100%",
                    height: "50px",
                    backgroundColor: "lightgrey",
                }}
            />


            <div
                {...resizerProps}
                style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "30px",
                    height: "30px",
                    backgroundColor: "lightgrey",
                }}
            />

            <span>I am a window!</span>
            <span>{props.windowId}</span>
            <button onClick={closeWindow}>Close</button>

        </div>
    );
}