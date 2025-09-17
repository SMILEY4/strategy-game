import {WorldObject} from "./worldObject";

export type WorldObjectComponent = WorldObjectComponent.Move | WorldObjectComponent.Vision

export namespace WorldObjectComponent {

	export enum Type {
		Vision = "vision",
		Move = "movement"
	}

	export type Mapping = {
		[Type.Vision]: Vision,
		[Type.Move]: Move,
	}


	export interface Move {
		type: Type.Move,
		maxMovement: number
	}


	export interface Vision {
		type: Type.Vision,
		radius: number
	}

	export function getOrNull<T extends Type>(worldObject: WorldObject, type: T): Mapping[T] | null {
		const component = worldObject.components.find((it): it is Mapping[T] => it.type === type);
		return component
			? component
			: null;
	}

	export function get<T extends Type>(worldObject: WorldObject, type: T): Mapping[T] {
		const component = getOrNull<T>(worldObject, type);
		if (!component) {
			throw new Error("Could not find component with type " + type + " on world object " + worldObject.id);
		}
		return component;
	}


	export function has<T extends Type>(worldObject: WorldObject, type: T): boolean {
		return !!getOrNull<T>(worldObject, type);
	}

}