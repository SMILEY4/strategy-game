import React, {ReactElement, useState} from "react";
import {AppConfig} from "../../../../main";
import {TilePosition} from "../../../../models/state/tilePosition";
import {TextField} from "../../../components/specific/TextField";

export function CreateCityDialog(props: { frameId: string, tile: TilePosition }): ReactElement {
    const actionAddCommand = AppConfig.di.get(AppConfig.DIQ.TurnAddCommandAction);
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    const [name, setName] = useState("");

    return (
        <div>
            Order creation of new city?
            <TextField value={name} onAccept={setName}/>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={() => onAccept()}>Create City</button>
        </div>
    );

    function onCancel() {
        uiService.close(props.frameId);
    }

    function onAccept() {
        uiService.close(props.frameId);
        actionAddCommand.addCreateCity(props.tile, name, null);
    }
}