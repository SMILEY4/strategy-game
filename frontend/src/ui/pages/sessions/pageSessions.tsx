import React, {ReactElement, useEffect, useState} from "react";
import {PanelDecorated} from "../../components/objects/panels/decorated/PanelDecorated";
import {PanelCloth} from "../../components/objects/panels/cloth/PanelCloth";
import {List} from "../../components/list/List";
import {
    useConnectGameSession,
    useCreateGameSession,
    useDeleteGameSessions,
    useJoinGameSession,
    useLoadGameSessions,
} from "../../hooks/gameSessions";
import {ButtonOutline} from "../../components/button/outline/ButtonOutline";
import {ButtonPrimary} from "../../components/button/primary/ButtonPrimary";
import {TextField} from "../../components/textfield/TextField";
import "./pageSessions.css";


export function PageSessions(): ReactElement {

    const {
        sessionIds,
        startCreate,
        cancelCreate,
        acceptCreate,
        seed,
        setSeed,
        startJoin,
        cancelJoin,
        acceptJoin,
        joinSessionId,
        setJoinSessionId,
        connect,
        drop,
        showDialogJoin,
        showDialogCreate,
    } = useSessions();

    return (
        <PanelCloth className="page-sessions" color="blue">
            <PanelDecorated className="page-sessions__panel" classNameContent="page-sessions__content">

                <h1>Sessions</h1>

                <List border="silver" className="page-sessions__list">
                    {sessionIds.map(sessionId => (
                        <div key={sessionId} className="page-sessions__list__row">
                            <div>{sessionId}</div>
                            <ButtonOutline onClick={() => drop(sessionId)}>Delete</ButtonOutline>
                            <ButtonOutline onClick={() => connect(sessionId)}>Connect</ButtonOutline>
                        </div>
                    ))}
                </List>

                <div className="page-sessions__actions">
                    <ButtonPrimary onClick={startCreate}>Create</ButtonPrimary>
                    <ButtonPrimary onClick={startJoin}>Join</ButtonPrimary>
                </div>

            </PanelDecorated>


            {showDialogJoin && (
                <div className="page-sessions__dialog-surface">
                    <PanelDecorated className="page-sessions__join" classNameContent="page-sessions__join-content">
                        <h1>Join</h1>
                        <TextField
                            value={joinSessionId}
                            onAccept={setJoinSessionId}
                            placeholder="Session Id"
                            type="text"
                            borderType="silver"
                        />
                        <div className="page-sessions__join__actions">
                            <ButtonOutline onClick={cancelJoin}>Cancel</ButtonOutline>
                            <ButtonPrimary onClick={acceptJoin} disabled={!joinSessionId}>Join</ButtonPrimary>
                        </div>
                    </PanelDecorated>
                </div>
            )}

            {showDialogCreate && (
                <div className="page-sessions__dialog-surface">
                    <PanelDecorated className="page-sessions__create" classNameContent="page-sessions__create-content">
                        <h1>Create</h1>
                        <TextField
                            value={seed}
                            onAccept={setSeed}
                            placeholder="Seed (Optional)"
                            type="text"
                            borderType="silver"
                        />
                        <div className="page-sessions__create__actions">
                            <ButtonOutline onClick={cancelCreate}>Cancel</ButtonOutline>
                            <ButtonPrimary onClick={acceptCreate}>Create</ButtonPrimary>
                        </div>
                    </PanelDecorated>
                </div>
            )}

        </PanelCloth>
    );
}


function useSessions() {

    const [sessions, setSessions] = useState<string[]>([]);
    const [showJoin, setShowJoin] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const [seed, setSeed] = useState("");
    const [sessionIdJoin, setSessionIdJoin] = useState("");

    const loadGameSessions = useLoadGameSessions();
    const createGameSession = useCreateGameSession();
    const joinGameSession = useJoinGameSession();
    const connectGameSession = useConnectGameSession();
    const deleteGameSession = useDeleteGameSessions();

    useEffect(() => loadSessions(), []);

    function loadSessions() {
        loadGameSessions()
            .then((list: string[]) => setSessions(list));
    }

    function startCreate() {
        setSeed("");
        setShowCreate(true);
    }

    function cancelCreate() {
        setSeed("");
        setShowCreate(false);
    }

    function acceptCreate() {
        setSeed("");
        setShowCreate(false);
        createGameSession(getCleanSeed(seed))
            .then(() => loadSessions())
            .catch(console.error);
    }

    function getCleanSeed(seed: string) {
        let cleanSeed = seed.trim();
        if (cleanSeed.length === 0) {
            return null;
        } else {
            return cleanSeed;
        }
    }

    function startJoin() {
        setSessionIdJoin("");
        setShowJoin(true);
    }

    function cancelJoin() {
        setSessionIdJoin("");
        setShowJoin(false);
    }

    function acceptJoin() {
        setSessionIdJoin("");
        setShowJoin(false);
        joinGameSession(sessionIdJoin)
            .then(() => loadSessions())
            .catch(console.error);
    }

    function connect(sessionId: string) {
        connectGameSession(sessionId);
    }

    function drop(sessionId: string) {
        deleteGameSession(sessionId)
            .then(() => loadSessions())
            .catch(console.error);
    }

    return {
        sessionIds: sessions,
        startCreate: startCreate,
        cancelCreate: cancelCreate,
        acceptCreate: acceptCreate,
        seed: seed,
        setSeed: setSeed,
        startJoin: startJoin,
        cancelJoin: cancelJoin,
        acceptJoin: acceptJoin,
        joinSessionId: sessionIdJoin,
        setJoinSessionId: setSessionIdJoin,
        connect: connect,
        drop: drop,
        showDialogJoin: showJoin,
        showDialogCreate: showCreate,
    };
}
