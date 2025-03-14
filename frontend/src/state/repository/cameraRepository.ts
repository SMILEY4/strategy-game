import {CameraDatabase} from "../database/cameraDatabase";
import {CameraEntity} from "../../models/misc/cameraEntity";
import {useSingletonEntity} from "../../common/db/adapters/databaseHooks";
import {useDI} from "../../appContext";

export class CameraRepository {

	private readonly cameraDb: CameraDatabase;

	constructor(cameraDb: CameraDatabase) {
		this.cameraDb = cameraDb;
	}

	public get(): CameraEntity {
		return this.cameraDb.get();
	}

	public set(camera: CameraEntity): void {
		return this.cameraDb.set(camera);
	}

}

export namespace CameraRepository {

	export function useCamera(): CameraEntity {
		const db = useDI<CameraDatabase>(CameraDatabase.name);
		return useSingletonEntity(db);
	}

}

