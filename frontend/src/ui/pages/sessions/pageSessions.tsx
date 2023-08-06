import React, {ReactElement, useEffect, useState} from "react";
import {PanelDecorated} from "../../components/panels/decorated/PanelDecorated";
import {PanelCloth} from "../../components/panels/cloth/PanelCloth";
import {List} from "../../components/controls/list/List";
import {ButtonGem} from "../../components/controls/button/gem/ButtonGem";
import {AppConfig} from "../../../main";
import {TextInput} from "../../components/controls/textinputfield/TextInput";
import {ButtonText} from "../../components/controls/button/text/ButtonText";
import {useNavigate} from "react-router-dom";
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
                            <ButtonGem onClick={() => drop(sessionId)}>Delete</ButtonGem>
                            <ButtonGem onClick={() => connect(sessionId)}>Connect</ButtonGem>
                        </div>
                    ))}
                </List>

                <div className="page-sessions__actions">
                    <ButtonGem onClick={startCreate}>Create</ButtonGem>
                    <ButtonGem onClick={startJoin}>Join</ButtonGem>
                </div>

            </PanelDecorated>


            {showDialogJoin && (
                <div className="page-sessions__dialog-surface">
                    <PanelDecorated className="page-sessions__join" classNameContent="page-sessions__join-content">
                        <h1>Join</h1>
                        <TextInput
                            value={joinSessionId}
                            onAccept={setJoinSessionId}
                            placeholder="Session Id"
                            type="text"
                            border="silver"
                        />
                        <div className="page-sessions__join__actions">
                            <ButtonText onClick={cancelJoin}>Cancel</ButtonText>
                            <ButtonGem onClick={acceptJoin} disabled={!joinSessionId}>Join</ButtonGem>
                        </div>
                    </PanelDecorated>
                </div>
            )}

            {showDialogCreate && (
                <div className="page-sessions__dialog-surface">
                    <PanelDecorated className="page-sessions__create" classNameContent="page-sessions__create-content">
                        <h1>Create</h1>
                        <TextInput
                            value={seed}
                            onAccept={setSeed}
                            placeholder="Seed (Optional)"
                            type="text"
                            border="silver"
                        />
                        <div className="page-sessions__create__actions">
                            <ButtonText onClick={cancelCreate}>Cancel</ButtonText>
                            <ButtonGem onClick={acceptCreate}>Create</ButtonGem>
                        </div>
                    </PanelDecorated>
                </div>
            )}

        </PanelCloth>
    );
}


function useSessions() {

    const actionListGames = AppConfig.di.get(AppConfig.DIQ.GameListAction);
    const actionCreateGame = AppConfig.di.get(AppConfig.DIQ.GameCreateAction);
    const actionJoin = AppConfig.di.get(AppConfig.DIQ.GameJoinAction);
    const actionConnect = AppConfig.di.get(AppConfig.DIQ.GameConnectAction);
    const actionDelete = AppConfig.di.get(AppConfig.DIQ.GameDeleteAction);
    const navigate = useNavigate();

    const [sessions, setSessions] = useState<string[]>([]);
    const [showJoin, setShowJoin] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const [seed, setSeed] = useState("");
    const [sessionIdJoin, setSessionIdJoin] = useState("");


    useEffect(() => loadSessions(), []);

    function loadSessions() {
        actionListGames.perform()
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
        actionCreateGame.perform(getCleanSeed(seed))
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
        actionJoin.perform(sessionIdJoin)
            .then(() => loadSessions())
            .catch(console.error);
    }

    function connect(sessionId: string) {
        actionConnect.perform(sessionId)
            .then(() => navigate("/game"))
            .catch(console.error);

    }

    function drop(sessionId: string) {
        actionDelete.perform(sessionId)
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
