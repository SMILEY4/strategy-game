import {WorldObject} from "./worldObject";

export type WorldObjectComponent =
    | WorldObjectComponent.Movement
    | WorldObjectComponent.Vision
    | WorldObjectComponent.Builder
    | WorldObjectComponent.SettlementSpawner
    | WorldObjectComponent.RouteNode

export namespace WorldObjectComponent {

    export enum Type {
        Vision = "vision",
        Movement = "movement",
        Builder = "builder",
        SettlementSpawner = "settlement-spawner",
        RouteNode = "route-node",
    }

    export type Mapping = {
        [Type.Vision]: Vision,
        [Type.Movement]: Movement,
        [Type.Builder]: Builder,
        [Type.SettlementSpawner]: SettlementSpawner,
        [Type.RouteNode]: RouteNode,
    }

    export interface Movement {
        type: Type.Movement,
        maxMovement: number
    }

    export interface Vision {
        type: Type.Vision,
        radius: number
    }

    export interface Builder {
        type: Type.Builder,
        maxUses: number;
        remainingUses: number;
        options: ({
            type: string,
            available: boolean
        })[]
    }

    export interface SettlementSpawner {
        type: Type.SettlementSpawner,
    }

    export interface RouteNode {
        type: Type.RouteNode,
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