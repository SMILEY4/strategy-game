import {CameraDatabase} from "../database/cameraDatabase";
import {CameraData} from "../../models/base/cameraData";
import {useSingletonEntity} from "../../common/db/adapters/databaseHooks";
import {useDI} from "../../appContext";

export class CameraRepository {

	private readonly cameraDb: CameraDatabase;

	constructor(cameraDb: CameraDatabase) {
		this.cameraDb = cameraDb;
	}

	public get(): CameraData {
		return this.cameraDb.get();
	}

	public set(camera: CameraData): void {
		return this.cameraDb.set(camera);
	}

}

export namespace CameraRepository {

	export function useCamera(): CameraData {
		const db = useDI<CameraDatabase>(CameraDatabase.name);
		return useSingletonEntity(db);
	}

}

