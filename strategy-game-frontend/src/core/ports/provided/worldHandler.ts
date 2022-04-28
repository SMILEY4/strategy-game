import {WorldMeta} from "../../../api/apiClientImpl";

export interface WorldHandler {
	create: () => Promise<WorldMeta>
	join: (worldId: string, playerName: string, ) => Promise<void>
	setInitialState: (state: any) => void
}