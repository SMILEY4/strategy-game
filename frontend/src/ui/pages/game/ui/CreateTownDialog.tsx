import React, {ReactElement, useState} from "react";
import {AppConfig} from "../../../../main";
import {TilePosition} from "../../../../core/models/tilePosition";
import {TextField} from "../../../components/specific/TextField";

export function CreateTownDialog(props: { frameId: string, tile: TilePosition }): ReactElement {
    const actionAddCommand = AppConfig.di.get(AppConfig.DIQ.TurnAddCommandAction);
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    const cityPreviewService = AppConfig.di.get(AppConfig.DIQ.GamePreviewCityCreation);
    const [name, setName] = useState("");

    return (
        <div>
            Order creation of new city?
            <TextField value={name} onAccept={setName}/>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onAccept}>Create Town</button>
        </div>
    );

    function onCancel() {
        uiService.close(props.frameId);
        cityPreviewService.clearPreview()
    }

    function onAccept() {
        uiService.close(props.frameId);
        cityPreviewService.clearPreview()
        actionAddCommand.addCreateCity(props.tile, name, false);
    }
}