import {Client, WorldMeta} from "../client/client";
import {GlobalState} from "../state/globalState";
import {Game} from "../core/game";

export class Distributor {

	private readonly client = new Client();
	private readonly gameCore = new Game();

	//====================//
	//   WORLD HANDLING   //
	//====================//

	public requestCreateWorld(): Promise<WorldMeta> {
		return this.client.createWorld();
	}


	public requestJoinWorld(worldId: string, navigate: (url: string) => void): Promise<void> {
		return this.client.openWorldMessageConnection()
			.then(() => GlobalState.useState.getState().setLoading(worldId))
			.then(() => this.client.sendJoinWorld(worldId))
			.then(() => navigate("/game"));
	}


	public receiveInitialWorldState(state: any) {
		GlobalState.useState.getState().setActive(state.map.tiles);
		this.gameCore.setTilemapDirty();
	}

	//====================//
	//   GAME LIFECYCLE   //
	//====================//

	public gameInitialize(canvas: HTMLCanvasElement) {
		this.gameCore.initialize(canvas);
	}

	public gameDestroy() {
		this.gameCore.dispose();
	}

	public gameRender() {
		this.gameCore.update();
	}

	//=====================//
	//  GAME PLAYER INPUT  //
	//=====================//

	public gameInputMouseMove(x: number, y: number, dx: number, dy: number, width: number, height: number, btnLeftDown: boolean, btnRightDown: boolean) {
		this.gameCore.input.onMouseMove(x, y, dx, dy, width, height, btnLeftDown, btnRightDown);
	}

	public gameInputMouseScroll(delta: number, x: number, y: number) {
		this.gameCore.input.onMouseScroll(delta, x, y);
	}

	public gameInputMouseLeave() {
		this.gameCore.input.onMouseLeave();
	}

	public gameInputMouseClick(x: number, y: number, width: number, height: number) {
		this.gameCore.input.onMouseClick(x, y, width, height);
	}

}
