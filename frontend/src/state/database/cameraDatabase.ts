import {AbstractSingletonDatabase} from "../../common/db/database/abstractSingletonDatabase";
import {CameraData} from "../../models/base/cameraData";

export class CameraDatabase extends AbstractSingletonDatabase<CameraData> {
	constructor() {
		super({
			x: 0,
			y: 0,
			zoom: 1,
		});
	}
}
