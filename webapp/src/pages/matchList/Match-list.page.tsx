import {Panel} from "@/modules/uicomponents/panel/Panel";
import {Txt} from "@/modules/uicomponents/text/Txt";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useMatchListViewModel} from "@pages/matchList/match-list.view-model.ts";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {TextField} from "@modules/uicomponents/controls/textfield/TextField.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {Separator} from "@modules/uicomponents/separator/Separator.tsx";
import {Selectbox} from "@modules/uicomponents/controls/selectbox/Selectbox.ts";
import {useState} from "react";
import type {MatchListEntry} from "@app/features/match/match.ts";
import {useRouting} from "@pages/routing.tsx";

const privacyItems = [
    {
        key: "public",
        text: "Public"
    },
    {
        key: "private",
        text: "Private"
    },
    {
        key: "hidden",
        text: "Hidden"
    }
]

export function MatchListPage() {

    const viewModel = useMatchListViewModel();

    return (
        <VerticalLayout center fillWidth fillHeight>
            <Panel.Decorated neutral noBorder sharpCorner paperPattern fillParent>

                <VerticalLayout fillWidth fillHeight verticalStart horizontalStretch paddingXl spacingXl>

                    <Txt.Heading h1 center><Txt.String>Multiplayer Lobby</Txt.String></Txt.Heading>

                    <HorizontalLayout horizontalSpaceBetween verticalStretch spacingL>
                        <SectionUserMatches {...viewModel}/>
                        <SectionPublicMatches/>
                        <VerticalLayout verticalStart horizontalStretch spacingL style={{
                            flexGrow: 1,
                            flexShrink: 1,
                            maxWidth: 500
                        }}>
                            <SectionCreateMatch {...viewModel}/>
                            <SectionJoinWithCode/>
                        </VerticalLayout>
                    </HorizontalLayout>

                </VerticalLayout>

            </Panel.Decorated>
        </VerticalLayout>
    );
}


function SectionUserMatches(props: ReturnType<typeof useMatchListViewModel>) {
    return (
        <Panel.Decorated neutral ornamentalBorder roundedCorner paperPattern style={{
            flexGrow: 1,
            flexShrink: 1
        }}>
            <VerticalLayout verticalStart horizontalStretch paddingL spacingM fillHeight>

                <Txt.Heading h3><Txt.String>My Lobbies</Txt.String></Txt.Heading>

                <VerticalLayout scrollable padding3xs spacingS>
                    {props.list.matches.map(match => (
                        <UserMatchEntry {...match} {...props} key={match.id}/>
                    ))}
                </VerticalLayout>

            </VerticalLayout>
        </Panel.Decorated>
    );
}

function SectionPublicMatches() {
    return (
        <Panel.Decorated neutral ornamentalBorder roundedCorner paperPattern style={{
            flexGrow: 1,
            flexShrink: 1
        }}>
            <VerticalLayout verticalStart horizontalStretch paddingL spacingM fillHeight>
                <Txt.Heading h3><Txt.String>Public Lobbies</Txt.String></Txt.Heading>
                <VerticalLayout scrollable padding3xs spacingS>
                    <Txt.Line center><Txt.String>Empty</Txt.String></Txt.Line>
                </VerticalLayout>
            </VerticalLayout>
        </Panel.Decorated>
    );
}


function UserMatchEntry(props: MatchListEntry & ReturnType<typeof useMatchListViewModel>) {
    const { gotoMatch } = useRouting()
    return (
        <Panel.Decorated fillWidth neutral lineBorder roundedCorner ornamentPattern style={{
            flexGrow: 0,
            flexShrink: 0
        }}>
            <HorizontalLayout verticalStretch horizontalSpaceBetween paddingS spacingS>
                <VerticalLayout verticalStart horizontalStretch spacing2xs>
                    <Txt.Heading h5><Txt.String>{props.name}</Txt.String></Txt.Heading>
                    <Txt.Body><Txt.String>Owned by ?</Txt.String></Txt.Body>
                    <Txt.Body><Txt.String>Turn ?; ?/? Players</Txt.String></Txt.Body>
                </VerticalLayout>
                <VerticalLayout verticalCenter horizontalStretch spacing2xs>
                    <Button success onClick={() => gotoMatch(props.id)}>Enter</Button>
                    <Button danger onClick={() => props.delete.execute(props.id)}>Delete</Button>
                </VerticalLayout>
            </HorizontalLayout>
        </Panel.Decorated>
    );
}

function SectionCreateMatch(props: ReturnType<typeof useMatchListViewModel>) {

    const [selectedPrivacy, setSelectedPrivacy] = useState({
        key: "private",
        text: "Private"
    });

    return (
        <Panel.Decorated neutral ornamentalBorder roundedCorner paperPattern>
            <VerticalLayout verticalStart horizontalStretch paddingL spacingM>

                <Txt.Heading h3><Txt.String>Create Lobby</Txt.String></Txt.Heading>

                <TextField.Root>
                    <TextField.Label>Lobby Name</TextField.Label>
                    <TextField.Control sizeM>
                        <TextField.Input
                            placeholder="Enter lobby name..."
                        />
                    </TextField.Control>
                </TextField.Root>

                <TextField.Root>
                    <TextField.Label>Max Players</TextField.Label>
                    <TextField.Control sizeM>
                        <TextField.Input
                            placeholder="Enter max player amount..."
                        />
                    </TextField.Control>
                </TextField.Root>

                <Selectbox.Root
                    items={privacyItems}
                    selectedItem={selectedPrivacy}
                    onSelectedItemChange={setSelectedPrivacy}
                    renderItem={item => (<Selectbox.Item key={item.key}>{item.text}</Selectbox.Item>)}
                >
                    <Selectbox.Control sizeM stableSize box/>
                    <Selectbox.List/>
                </Selectbox.Root>

                <Separator invisible size3xs/>

                <Button
                    sizeL
                    disabled={props.create.loading}
                    onClick={props.create.execute}
                >
                    Create Lobby
                </Button>

            </VerticalLayout>
        </Panel.Decorated>
    );
}

function SectionJoinWithCode() {
    return (
        <Panel.Decorated neutral ornamentalBorder roundedCorner paperPattern>
            <VerticalLayout verticalStart horizontalStretch paddingL spacingM>

                <Txt.Heading h3><Txt.String>Join with Invite Code</Txt.String></Txt.Heading>

                <TextField.Root>
                    <TextField.Label>Invite Code</TextField.Label>
                    <TextField.Control sizeM>
                        <TextField.Input
                            placeholder="Enter invite code..."
                        />
                    </TextField.Control>
                </TextField.Root>

                <Separator invisible size3xs/>

                <Button sizeL>Join Lobby</Button>

            </VerticalLayout>
        </Panel.Decorated>
    );
}