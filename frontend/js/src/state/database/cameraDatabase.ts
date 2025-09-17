import {AbstractSingletonDatabase} from "../../common/db/database/abstractSingletonDatabase";
import {CameraData} from "../../models/misc/cameraData";

export class CameraDatabase extends AbstractSingletonDatabase<CameraData> {
	constructor() {
		super({
			x: 0,
			y: 0,
			zoom: 3.5,
		});
	}
}