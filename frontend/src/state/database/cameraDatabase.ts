import {AbstractSingletonDatabase} from "../../common/db/database/abstractSingletonDatabase";
import {CameraData} from "../../models/base/cameraData";
import {useSingletonEntity} from "../../common/db/adapters/databaseHooks";
import {AppCtx} from "../../appContext";

export class CameraDatabase extends AbstractSingletonDatabase<CameraData> {
    constructor() {
        super({
            x: 0,
            y: 0,
            zoom: 1,
        });
    }
}

export namespace CameraDatabase {

    export function useCamera(): CameraData {
        return useSingletonEntity(AppCtx.CameraDatabase())
    }

}
