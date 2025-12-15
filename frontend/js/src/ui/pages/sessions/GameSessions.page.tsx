import React, {ReactElement} from "react";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {HBox} from "../../components/layout/hbox/HBox";
import {Button} from "../../components/button/Button";
import {InsetPanel} from "../../components/panels/inset/InsetPanel";
import {TextField} from "../../components/textfield/TextField";
import {VSpacer} from "../../components/spacer/Spacer";
import {Game} from "../../../models/misc/game";
import {BackgroundPanel} from "../../components/panels/background/BackgroundPanel";
import {ModalWindow} from "../../components/modal/ModalWindow";
import {Txt} from "../../components/text/Txt";
import {useGameSessionsList} from "../../../app/gamesession/gamesession.hook.list";
import {useCreateSession} from "./gameSessions.page.hook.create";
import {useJoinSession} from "./gameSessions.page.hook.join";
import {useDeleteSession} from "./gameSessions.page.hook.delete";
import {useStartSession} from "./gameSessions.page.hook.start";


export function PageGameSessions(): ReactElement {

    const [sessions, reloadSessions] = useGameSessionsList();

    const {
        startCreateSession,
        cancelCreateSession,
        acceptCreateSession,
        showCreateSession,
        seed,
        setSeed,
        name,
        setName,
    } = useCreateSession(reloadSessions);

    const {
        startJoinSession,
        cancelJoinSession,
        acceptJoinSession,
        showJoinSession,
        sessionIdJoin,
        setSessionIdJoin,
    } = useJoinSession(reloadSessions);

    const deleteSession = useDeleteSession(reloadSessions);
    const connectSession = useStartSession();

    return (
        <BackgroundPanel image="/images/image_2.bmp">

            <DecoratedPanel ornament style={{
                width: "min(70%, 700px)",
                height: "min(80%, 600px)",
            }}>
                <VBox fullSize padding_l centerVertical stretch gap_s>

                    <Txt.Header1>
                        <Txt.String>Game Sessions</Txt.String>
                    </Txt.Header1>

                    <VSpacer size_s/>

                    <InsetPanel grow shrink>
                        <VBox scrollable padding_s fullSize>
                            {sessions.map(session => (
                                <GameSessionEntry
                                    key={session.id}
                                    session={session}
                                    onConnect={() => connectSession(session.id)}
                                    onDelete={() => deleteSession(session.id)}
                                />
                            ))}

                        </VBox>
                    </InsetPanel>

                    <VSpacer size_s/>

                    <HBox right gap_s dontGrow dontShrink>
                        <Button success onClick={startCreateSession}>Create</Button>
                        <Button success onClick={startJoinSession}>Join</Button>
                    </HBox>

                </VBox>
            </DecoratedPanel>

            {showJoinSession && (
                <ModalJoinGame
                    sessionId={sessionIdJoin}
                    onSessionId={setSessionIdJoin}
                    onCancel={cancelJoinSession}
                    onAccept={acceptJoinSession}
                    acceptDisabled={!sessionIdJoin}
                />
            )}

            {showCreateSession && (
                <ModalCreateGame
                    name={name}
                    setName={setName}
                    seed={seed}
                    onSeed={setSeed}
                    onCancel={cancelCreateSession}
                    onAccept={acceptCreateSession}
                />
            )}

        </BackgroundPanel>
    );
}

function GameSessionEntry(props: {
    session: Game,
    onConnect: () => void,
    onDelete: () => void
}): ReactElement {
    return (
        <DecoratedPanel pattern blue>
            <HBox padding_m gap_s>
                <VBox grow shrink gap_xs>
                    <Txt.Header3>
                        <Txt.String>{props.session.name}</Txt.String>
                    </Txt.Header3>
                    <HBox gap_xs wrap>
                        <Txt.Body secondary style={{marginRight: "16px"}}>
                            <Txt.String>
                                {"Created: " + new Date(props.session.creationTimestamp).toLocaleDateString(undefined, {})}
                            </Txt.String>
                        </Txt.Body>
                        <Txt.Body secondary style={{marginRight: "16px"}}>
                            <Txt.String>
                                {"Id: " + props.session.id}
                            </Txt.String>
                        </Txt.Body>
                        <Txt.Body secondary style={{marginRight: "16px"}}>
                            <Txt.String>
                                {"Turn: " + props.session.currentTurn}
                            </Txt.String>
                        </Txt.Body>
                    </HBox>
                </VBox>
                <Button info onClick={props.onConnect}>Connect</Button>
                <Button warn onClick={props.onDelete} soundId={"CLICK_CLOSE"}>Delete</Button>
            </HBox>
        </DecoratedPanel>
    );
}

function ModalJoinGame(props: {
    sessionId: string,
    onSessionId: (id: string) => void,
    onCancel: () => void,
    onAccept: () => void,
    acceptDisabled: boolean
}): ReactElement {
    return (
        <ModalWindow>
            <DecoratedPanel ornament>
                <VBox padding_l gap_m>

                    <Txt.Header1>
                        <Txt.String>Join</Txt.String>
                    </Txt.Header1>

                    <TextField
                        value={props.sessionId}
                        placeholder={"Session-Id"}
                        type="text"
                        onChange={props.onSessionId}
                    />

                    <HBox right gap_xs>
                        <Button warn onClick={props.onCancel} soundId={"CLICK_CLOSE"}>Cancel</Button>
                        <Button success onClick={props.onAccept} disabled={props.acceptDisabled}>Join</Button>
                    </HBox>

                </VBox>
            </DecoratedPanel>
        </ModalWindow>
    );
}

function ModalCreateGame(props: {
    name: string,
    setName: (name: string) => void,
    seed: string,
    onSeed: (seed: string) => void,
    onCancel: () => void,
    onAccept: () => void,
}): ReactElement {
    return (
        <ModalWindow>
            <DecoratedPanel ornament>
                <VBox padding_l gap_m>

                    <Txt.Header1>
                        <Txt.String>Create</Txt.String>
                    </Txt.Header1>

                    <VBox gap_s>

                        <TextField
                            value={props.name}
                            placeholder={"Name"}
                            type="text"
                            onChange={props.setName}
                        />

                        <TextField
                            value={props.seed}
                            placeholder={"Seed (Optional)"}
                            type="text"
                            onChange={props.onSeed}
                        />

                    </VBox>

                    <HBox right gap_xs>
                        <Button warn onClick={props.onCancel} soundId={"CLICK_CLOSE"}>Cancel</Button>
                        <Button success onClick={props.onAccept}>Create</Button>
                    </HBox>

                </VBox>
            </DecoratedPanel>
        </ModalWindow>
    );
}
