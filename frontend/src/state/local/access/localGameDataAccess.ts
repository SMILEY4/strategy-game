import {CameraData} from "../../../models/base/cameraData";
import {CameraDatabase} from "../../database/cameraDatabase";

export interface LocalGameDataAccess {
	getCamera(): CameraData;
}

export class LocalGameDataAccessImpl implements LocalGameDataAccess {

	private readonly cameraDatabase: CameraDatabase;

	constructor(cameraDatabase: CameraDatabase) {
		this.cameraDatabase = cameraDatabase;
	}

	getCamera(): CameraData {
		return this.cameraDatabase.get();
	}
}