import {CameraEntity} from "../../models/misc/cameraEntity";
import {CameraDatabase} from "../database/cameraDatabase";

export interface LocalGameDataAccess {
	getCamera(): CameraEntity;
}

export class LocalGameDataAccessImpl implements LocalGameDataAccess {

	private readonly cameraDatabase: CameraDatabase;

	constructor(cameraDatabase: CameraDatabase) {
		this.cameraDatabase = cameraDatabase;
	}

	getCamera(): CameraEntity {
		return this.cameraDatabase.get();
	}
}