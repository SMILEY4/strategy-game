import React, {ReactElement, useEffect, useState} from "react";
import * as gameSession from "../../hooks/gameSessions";
import {BackgroundImagePanel} from "../../components/panels/backgroundimage/BackgroundImagePanel";
import {DecoratedPanel} from "../../components/panels/decorated/DecoratedPanel";
import {VBox} from "../../components/layout/vbox/VBox";
import {Header1, Header3} from "../../components/header/Header";
import {HBox} from "../../components/layout/hbox/HBox";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {InsetPanel} from "../../components/panels/inset/InsetPanel";
import {TextField} from "../../components/textfield/TextField";
import {Spacer} from "../../components/spacer/Spacer";
import "./pageSessions.less";


export function PageSessions(): ReactElement {

    const {
        sessions,
        loadSessions,
    } = useSessionData();

    const {
        startCreateSession,
        cancelCreateSession,
        acceptCreateSession,
        showCreateSession,
        seed,
        setSeed,
    } = useCreateSession(loadSessions);

    const {
        startJoinSession,
        cancelJoinSession,
        acceptJoinSession,
        showJoinSession,
        sessionIdJoin,
        setSessionIdJoin,
    } = useJoinSession(loadSessions);

    const deleteSession = useDeleteSession(loadSessions);
    const connectSession = useStartSession();

    useEffect(() => {
        loadSessions();
    }, []);

    return (
        <BackgroundImagePanel fillParent centerContent image="/images/image_2.bmp" className="page-sessions">
            <DecoratedPanel red floating>
                <VBox gap_s fillParent centerVertical stretch>

                    <Spacer size="xs"/>

                    <Header1>Game Sessions</Header1>

                    <Spacer size="m"/>

                    <InsetPanel noPadding fillParent className="page-sessions__list__container">
                        <VBox padding_s gap_s fillParent top stretch className="page-sessions__list__content">
                            {sessions.map(sessionId => (
                                <GameSessionEntry
                                    name={sessionId}
                                    onConnect={() => connectSession(sessionId)}
                                    onDelete={() => deleteSession(sessionId)}
                                />
                            ))}
                        </VBox>
                    </InsetPanel>

                    <Spacer size="s"/>

                    <HBox gap_s centerVertical right>
                        <ButtonPrimary green onClick={startCreateSession}>
                            Create
                        </ButtonPrimary>
                        <ButtonPrimary green onClick={startJoinSession}>
                            Join
                        </ButtonPrimary>
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
                    seed={seed}
                    onSeed={setSeed}
                    onCancel={cancelCreateSession}
                    onAccept={acceptCreateSession}
                />
            )}

        </BackgroundImagePanel>
    );
}

function GameSessionEntry(props: { name: string, onConnect: () => void, onDelete: () => void }): ReactElement {
    return (
        <DecoratedPanel blue simpleBorder className="game-session-entry">
            <HBox gap_s centerVertical right>
                <Header3>{props.name}</Header3>
                <ButtonPrimary blue onClick={props.onConnect}>Connect</ButtonPrimary>
                <ButtonPrimary red onClick={props.onDelete}>Delete</ButtonPrimary>
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
        <div className="game-session__modal-surface">
            <DecoratedPanel red className="game-session__modal-join">
                <VBox centerVertical stretch>

                    <Header1>Join</Header1>

                    <TextField
                        value={props.sessionId}
                        placeholder={"Session-Id"}
                        type="text"
                        onChange={props.onSessionId}
                    />

                    <div/>

                    <HBox centerVertical right>
                        <ButtonPrimary red onClick={props.onCancel}>
                            Cancel
                        </ButtonPrimary>
                        <ButtonPrimary green onClick={props.onAccept} disabled={props.acceptDisabled}>
                            Join
                        </ButtonPrimary>
                    </HBox>

                </VBox>
            </DecoratedPanel>
        </div>
    );
}

function ModalCreateGame(props: {
    seed: string,
    onSeed: (seed: string) => void,
    onCancel: () => void,
    onAccept: () => void,
}): ReactElement {
    return (
        <div className="game-session__modal-surface">
            <DecoratedPanel red className="game-session__modal-create">
                <VBox centerVertical stretch>

                    <Header1>Create</Header1>

                    <TextField
                        value={props.seed}
                        placeholder={"Seed (Optional)"}
                        type="text"
                        onChange={props.onSeed}
                    />

                    <div/>

                    <HBox centerVertical right>
                        <ButtonPrimary red onClick={props.onCancel}>
                            Cancel
                        </ButtonPrimary>
                        <ButtonPrimary green onClick={props.onAccept}>
                            Create
                        </ButtonPrimary>
                    </HBox>

                </VBox>
            </DecoratedPanel>
        </div>
    );
}


function useSessionData() {
    const [sessions, setSessions] = useState<string[]>([]);
    const loadGameSessions = gameSession.useLoadGameSessions();

    return {
        sessions: sessions,
        loadSessions: () => {
            loadGameSessions()
                .then((list: string[]) => setSessions(list));
        },
    };
}

function useCreateSession(reloadSessions: () => void) {
    const createGameSession = gameSession.useCreateGameSession();
    const [show, setShow] = useState(false);
    const [seed, setSeed] = useState("");

    function getCleanSeed(seed: string) {
        let cleanSeed = seed.trim();
        if (cleanSeed.length === 0) {
            return null;
        } else {
            return cleanSeed;
        }
    }

    return {
        startCreateSession: () => {
            setSeed("");
            setShow(true);
        },
        cancelCreateSession: () => {
            setSeed("");
            setShow(false);
        },
        acceptCreateSession: () => {
            setSeed("");
            setShow(false);
            createGameSession(getCleanSeed(seed))
                .then(() => reloadSessions())
                .catch(console.error);
        },
        showCreateSession: show,
        seed: seed,
        setSeed: setSeed,
    };

}

function useJoinSession(reloadSessions: () => void) {
    const joinGameSession = gameSession.useJoinGameSession();
    const [show, setShow] = useState(false);
    const [sessionId, setSessionId] = useState("");

    return {
        startJoinSession: () => {
            setSessionId("");
            setShow(true);
        },
        cancelJoinSession: () => {
            setSessionId("");
            setShow(false);
        },
        acceptJoinSession: () => {
            setSessionId("");
            setShow(false);
            joinGameSession(sessionId)
                .then(() => reloadSessions())
                .catch(console.error);
        },
        showJoinSession: show,
        sessionIdJoin: sessionId,
        setSessionIdJoin: setSessionId,
    };
}

function useDeleteSession(reloadSessions: () => void) {
    const deleteGameSession = gameSession.useDeleteGameSession();
    return (id: string) => {
        deleteGameSession(id)
            .then(() => reloadSessions())
            .catch(console.error);
    };
}

function useStartSession() {
    const startGameSession = gameSession.useStartGameSession();
    return (id: string) => {
        startGameSession(id);
    };
}
