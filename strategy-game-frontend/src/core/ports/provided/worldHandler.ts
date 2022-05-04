import {WorldMeta} from "../../../state/models/WorldMeta";

export interface WorldHandler {
	create: () => Promise<WorldMeta>;
	join: (worldId: string) => Promise<void>;
	setInitialState: (state: any) => void;
}