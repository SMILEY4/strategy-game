import {AbstractSingletonDatabase} from "../../common/db/database/abstractSingletonDatabase";
import {CameraEntity} from "../../models/misc/cameraEntity";

export class CameraDatabase extends AbstractSingletonDatabase<CameraEntity> {
	constructor() {
		super({
			x: 0,
			y: 0,
			zoom: 10,
		});
	}
}
