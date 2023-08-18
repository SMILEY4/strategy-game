import React, {ReactElement, useEffect, useState} from "react";
import * as gameSession from "../../hooks/gameSessions";
import "./pageSessions.css";


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
    const connectSession = useConnectSession();

    useEffect(() => {
        loadSessions()
    }, [])

    return <div>TODO</div>
    // return (
    //     <PanelCloth className="page-sessions" color="blue">
    //         <PanelDecorated className="page-sessions__panel" classNameContent="page-sessions__content">
    //
    //             <h1>Sessions</h1>
    //
    //             <List borderType="silver" className="page-sessions__list">
    //                 {sessions.map(sessionId => (
    //                     <div key={sessionId} className="page-sessions__list__row">
    //                         <div>{sessionId}</div>
    //                         <ButtonOutline onClick={() => deleteSession(sessionId)}>Delete</ButtonOutline>
    //                         <ButtonOutline onClick={() => connectSession(sessionId)}>Connect</ButtonOutline>
    //                     </div>
    //                 ))}
    //             </List>
    //
    //             <div className="page-sessions__actions">
    //                 <ButtonPrimary onClick={startCreateSession}>Create</ButtonPrimary>
    //                 <ButtonPrimary onClick={startJoinSession}>Join</ButtonPrimary>
    //             </div>
    //
    //         </PanelDecorated>
    //
    //
    //         {showJoinSession && (
    //             <div className="page-sessions__dialog-surface">
    //                 <PanelDecorated className="page-sessions__join" classNameContent="page-sessions__join-content">
    //                     <h1>Join</h1>
    //                     <TextFieldPrimary
    //                         value={sessionIdJoin}
    //                         onChange={setSessionIdJoin}
    //                         placeholder="Session Id"
    //                         type="text"
    //                         borderType="silver"
    //                     />
    //                     <div className="page-sessions__join__actions">
    //                         <ButtonOutline onClick={cancelJoinSession}>Cancel</ButtonOutline>
    //                         <ButtonPrimary onClick={acceptJoinSession} disabled={!sessionIdJoin}>Join</ButtonPrimary>
    //                     </div>
    //                 </PanelDecorated>
    //             </div>
    //         )}
    //
    //         {showCreateSession && (
    //             <div className="page-sessions__dialog-surface">
    //                 <PanelDecorated className="page-sessions__create" classNameContent="page-sessions__create-content">
    //                     <h1>Create</h1>
    //                     <TextFieldPrimary
    //                         value={seed}
    //                         onChange={setSeed}
    //                         placeholder="Seed (Optional)"
    //                         type="text"
    //                         borderType="silver"
    //                     />
    //                     <div className="page-sessions__create__actions">
    //                         <ButtonOutline onClick={cancelCreateSession}>Cancel</ButtonOutline>
    //                         <ButtonPrimary onClick={acceptCreateSession}>Create</ButtonPrimary>
    //                     </div>
    //                 </PanelDecorated>
    //             </div>
    //         )}
    //
    //     </PanelCloth>
    // );
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

function useConnectSession() {
    const connectGameSession = gameSession.useConnectGameSession();
    return (id: string) => {
        connectGameSession(id);
    };
}
