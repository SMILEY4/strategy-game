import {AbstractSingletonDatabase} from "../shared/db/database/abstractSingletonDatabase";
import {CameraData} from "../models/cameraData";

export class CameraDatabase extends AbstractSingletonDatabase<CameraData> {
    constructor() {
        super({
            x: 0,
            y: 0,
            zoom: 1,
        });
    }
}
