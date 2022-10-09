import React, {ReactElement, useState} from "react";
import {useTileAt} from "../../../../core/hooks/useTileAt";
import {AppConfig} from "../../../../main";
import {TilePosition} from "../../../../models/state/tilePosition";
import {TextField} from "../../../components/specific/TextField";

export function CreateTownDialog(props: { frameId: string, tile: TilePosition }): ReactElement {
    const actionAddCommand = AppConfig.di.get(AppConfig.DIQ.TurnAddCommandAction);
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    const [name, setName] = useState("");
    const tile = useTileAt(props.tile);

    return (
        <div>
            Order creation of new city?
            <TextField value={name} onAccept={setName}/>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={() => onAccept(tile?.generalData?.owner?.cityId!!)}>Create Town</button>
        </div>
    );

    function onCancel() {
        uiService.close(props.frameId);
    }

    function onAccept(cityId: string) {
        close();
        actionAddCommand.addCreateCity(props.tile, name, cityId);
    }
}