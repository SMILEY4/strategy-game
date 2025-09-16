import {WorldObject} from "./worldObject";

export type WorldObjectComponentType = "movement" | "vision"

export interface WorldObjectComponent {
	type: WorldObjectComponentType;
}

export namespace WorldObjectComponent {

	export function get<T extends WorldObjectComponent>(worldObject: WorldObject, type: WorldObjectComponentType): T {
		const component = getOrNull<T>(worldObject, type);
		if (component == null) {
			throw new Error("World object " + worldObject.id + " does not have component of type " + type + ".");
		}
		return component;
	}

	export function getOrNull<T extends WorldObjectComponent>(worldObject: WorldObject, type: WorldObjectComponentType): T | null {
		const component = worldObject.components.find(it => it.type === type);
		if (component) {
			return component as T;
		} else {
			return null;
		}
	}

	export interface Move extends WorldObjectComponent {
		type: "movement",
		maxMovement: number
	}


	export interface Vision extends WorldObjectComponent {
		type: "vision",
		radius: number
	}

}