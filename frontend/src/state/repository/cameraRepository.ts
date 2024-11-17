import {CameraDatabase} from "../database/cameraDatabase";
import {CameraData} from "../../models/base/cameraData";

export class CameraRepository {

	private readonly cameraDb: CameraDatabase;

	constructor(cameraDb: CameraDatabase,) {
		this.cameraDb = cameraDb;
	}

	public get(): CameraData {
		return this.cameraDb.get();
	}

	public set(camera: CameraData): void {
		return this.cameraDb.set(camera);
	}

}