import {Panel} from "@/modules/uicomponents/panel/Panel";
import {Txt} from "@/modules/uicomponents/text/Txt";
import {VerticalLayout} from "@modules/uicomponents/layout/vertical/VerticalLayout.tsx";
import {useMatchListViewModel} from "@pages/matchList/match-list.view-model.ts";
import {HorizontalLayout} from "@modules/uicomponents/layout/horizontal/HorizontalLayout.tsx";
import {TextField} from "@modules/uicomponents/controls/textfield/TextField.tsx";
import {Button} from "@modules/uicomponents/controls/button/Button.tsx";
import {Separator} from "@modules/uicomponents/separator/Separator.tsx";

export function MatchListPage() {

    const viewModel = useMatchListViewModel();

    return (
        <VerticalLayout center fillWidth fillHeight>
            <Panel.Decorated neutral noBorder sharpCorner paperPattern fillParent>

                <VerticalLayout fillWidth fillHeight verticalStart horizontalStretch paddingXl spacingXl>

                    <Txt.Heading h1 center><Txt.String>Multiplayer Lobby</Txt.String></Txt.Heading>

                    <HorizontalLayout horizontalSpaceBetween verticalStretch spacingL>
                        <SectionUserMatches/>
                        <SectionPublicMatches/>
                        <VerticalLayout verticalStart horizontalStretch spacingL style={{
                            flexGrow: 1,
                            flexShrink: 1
                        }}>
                            <SectionCreateMatch/>
                            <SectionJoinWithCode/>
                        </VerticalLayout>
                    </HorizontalLayout>

                </VerticalLayout>

            </Panel.Decorated>
        </VerticalLayout>
    );

    // return (
    //     <VerticalLayout center fillWidth fillHeight>
    //         <VerticalLayout verticalStart horizontalStretch spacingS>
    //             <button onClick={viewModel.create.execute}>Create</button>
    //             {viewModel.list.loading && (
    //                 <div>Loading...</div>
    //             )}
    //             {!viewModel.list.loading && viewModel.list.matches.map(match => (
    //                 <HorizontalLayout key={match.id} verticalCenter horizontalSpaceBetween style={{border: "1px solid gray", padding: "10px"}}>
    //                     <Link to={`/match/${match.id}`}>{match.name}</Link>
    //                     <button onClick={() => viewModel.delete.execute(match.id)}>Delete</button>
    //                 </HorizontalLayout>
    //             ))}
    //         </VerticalLayout>
    //     </VerticalLayout>
    // );
}


function SectionUserMatches() {
    return (
        <Panel.Decorated neutral ornamentalBorder roundedCorner paperPattern style={{
            flexGrow: 1,
            flexShrink: 1
        }}>
            <VerticalLayout verticalStart horizontalStretch paddingL spacingM fillHeight>

                <Txt.Heading h3><Txt.String>My Lobbies</Txt.String></Txt.Heading>

                <VerticalLayout scrollable padding3xs spacingS>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
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
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                    <UserMatchEntry/>
                </VerticalLayout>

            </VerticalLayout>
        </Panel.Decorated>
    );
}


function UserMatchEntry() {
    return (
        <Panel.Decorated fillWidth neutral lineBorder roundedCorner paperPattern style={{
            flexGrow: 0,
            flexShrink: 0
        }}>
            <VerticalLayout verticalStart horizontalStretch paddingS spacing2xs>
                <Txt.Heading h5><Txt.String>User Match</Txt.String></Txt.Heading>
                <Txt.Body><Txt.String>Owned by user</Txt.String></Txt.Body>
                <Txt.Body><Txt.String>Turn 12; 8/8 Players</Txt.String></Txt.Body>
            </VerticalLayout>
        </Panel.Decorated>
    );
}

function PublicMatchEntry() {
    return (
        <Panel.Decorated fillWidth neutral lineBorder roundedCorner paperPattern style={{
            flexGrow: 0,
            flexShrink: 0
        }}>
            <VerticalLayout verticalStart horizontalStretch paddingS spacing2xs>
                <Txt.Heading h5><Txt.String>Public Match</Txt.String></Txt.Heading>
                <Txt.Body><Txt.String>Owned by user</Txt.String></Txt.Body>
                <Txt.Body><Txt.String>Turn 12; 8/8 Players</Txt.String></Txt.Body>
            </VerticalLayout>
        </Panel.Decorated>
    );
}

function SectionCreateMatch() {
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
                            placeholder=""
                        />
                    </TextField.Control>
                </TextField.Root>

                <TextField.Root>
                    <TextField.Label>Privacy</TextField.Label>
                    <TextField.Control sizeM>
                        <TextField.Input
                            placeholder=""
                        />
                    </TextField.Control>
                </TextField.Root>

                <Separator invisible size3xs/>

                <Button sizeL>Create Lobby</Button>

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