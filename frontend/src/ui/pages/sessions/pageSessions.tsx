import React, {ReactElement, useState} from "react";
import {PanelDecorated} from "../../components/panels/decorated/PanelDecorated";
import {PanelCloth} from "../../components/panels/cloth/PanelCloth";
import {List} from "../../components/controls/list/List";
import {ButtonGem} from "../../components/controls/button/gem/ButtonGem";
import "./pageSessions.css";


export function PageSessions(): ReactElement {

    const {
        sessionIds,
        create,
        join,
        connect,
        drop,
    } = useSessions();

    return (
        <PanelCloth className="page-sessions" color="blue">
            <PanelDecorated className="page-sessions__panel" classNameContent="page-sessions__content">

                <h1>Sessions</h1>

                <List border="silver" className="page-sessions__list">
                    {sessionIds.map(sessionId => (
                        <SessionRowItem
                            key={sessionId}
                            name={sessionId}
                            onDelete={() => drop(sessionId)}
                            onConnect={() => connect(sessionId)}
                        />
                    ))}
                </List>

                <div className="page-sessions__actions">
                    <ButtonGem onClick={create}>Create</ButtonGem>
                    <ButtonGem onClick={join}>Join</ButtonGem>
                </div>

            </PanelDecorated>
        </PanelCloth>
    );
}

interface SessionRowItemProps {
    name: string,
    onDelete: () => void,
    onConnect: () => void
}

function SessionRowItem(props: SessionRowItemProps): ReactElement {
    return (
        <div className="page-sessions__list__row">
            <div>{props.name}</div>
            <ButtonGem onClick={props.onDelete}>Delete</ButtonGem>
            <ButtonGem onClick={props.onConnect}>Connect</ButtonGem>
        </div>
    );
}


function useSessions() {

    const arrSessions = [...Array(30).keys()].map((_, i) => "" + i);
    const [sessions, setSessions] = useState(arrSessions);

    function create() {
    }

    function join() {
    }

    function connect(sessionId: string) {
    }

    function drop(sessionId: string) {
    }

    return {
        sessionIds: sessions,
        create: create,
        join: join,
        connect: connect,
        drop: drop,
    };
}
