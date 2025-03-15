import {InterfaceService, InterfaceServiceImpl} from "./logic/game/interfaceService";
import {GameRenderer} from "./renderer/game/gameRenderer";
import {TileService, TileServiceImpl} from "./logic/game/tileService";
import {CameraService, CameraServiceImpl} from "./logic/game/cameraService";
import {MovementService, MovementServiceImpl} from "./logic/game/movementService";
import {TurnEndService, TurnEndServiceImpl} from "./logic/game/turnEndService";
import {SettlementService, SettlementServiceImpl} from "./logic/game/settlementService";
import {GameStateWriter, GameStateWriterImpl} from "./state/gameStateWriter";
import {AudioService} from "./common/audioService";
import {LocalStateAccess, LocalStateAccessImpl} from "./state/localStateAccess";
import {CameraDatabase} from "./state/database/cameraDatabase";
import {CommandDatabase} from "./state/database/commandDatabase";
import {CountryDatabase} from "./state/database/countryDatabase";
import {GameSessionDatabase} from "./state/database/gameSessionDatabase";
import {RouteDatabase} from "./state/database/routeDatabase";
import {SettlementDatabase} from "./state/database/settlementDatabase";
import {TileDatabase} from "./state/database/tileDatabase";
import {WorldObjectDatabase} from "./state/database/worldObjectDatabase";
import {GameClient} from "./logic/game/gameClient";
import {AuthProvider} from "./logic/user/authProvider";
import {GameIdProvider} from "./logic/session/gameIdProvider";
import {HttpClient} from "./common/httpClient";
import {CommandService, CommandServiceImpl} from "./logic/game/commandService";
import {ChangeProvider} from "./renderer/common/graph/changeProvider";
import {GameChangeProvider} from "./renderer/game/gameChangeProvider";
import {GameSessionService, GameSessionServiceImpl} from "./logic/session/gameSessionService";
import {GameSessionClient} from "./logic/session/gameSessionClient";
import {WebsocketClient} from "./common/websocketClient";
import {TurnStartService, TurnStartServiceImpl} from "./logic/game/turnStartService";
import {LocalStateHooks} from "./state/localStateHooks";
import {UserService} from "./logic/user/userService";
import {UserClient} from "./logic/user/userClient";

const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;

export namespace App {

	// database
	const cameraDatabase: CameraDatabase = new CameraDatabase();
	const commandDatabase: CommandDatabase = new CommandDatabase();
	const countryDatabase: CountryDatabase = new CountryDatabase();
	const gameSessionDatabase: GameSessionDatabase = new GameSessionDatabase();
	const routeDatabase: RouteDatabase = new RouteDatabase();
	const settlementDatabase: SettlementDatabase = new SettlementDatabase();
	const tileDatabase: TileDatabase = new TileDatabase();
	const worldObjectDatabase: WorldObjectDatabase = new WorldObjectDatabase();

	// state read / write
	const gameStateWriter: GameStateWriter = new GameStateWriterImpl(
		commandDatabase,
		tileDatabase,
		countryDatabase,
		settlementDatabase,
		worldObjectDatabase,
		routeDatabase,
		cameraDatabase,
		gameSessionDatabase
	);
	const localStateAccess: LocalStateAccess = new LocalStateAccessImpl(
		cameraDatabase,
		tileDatabase,
		gameSessionDatabase,
		countryDatabase,
		worldObjectDatabase,
		settlementDatabase,
		routeDatabase,
		commandDatabase
	);

	// providers
	const authProvider: AuthProvider = new AuthProvider(localStateAccess);
	const gameIdProvider: GameIdProvider = new GameIdProvider();

	// api clients
	const httpClient: HttpClient = new HttpClient(API_BASE_URL);

	const userClient: UserClient = new UserClient(authProvider, httpClient);
	const gameClient: GameClient = new GameClient(authProvider, gameIdProvider, httpClient);
	const gameSessionClient: GameSessionClient = new GameSessionClient(authProvider, httpClient, new WebsocketClient(API_WS_BASE_URL));

	// core services
	const commandService: CommandService = new CommandServiceImpl(gameStateWriter);
	const movementService: MovementService = new MovementServiceImpl(localStateAccess, gameStateWriter, gameClient, commandService);
	const turnStartService: TurnStartService = new TurnStartServiceImpl(gameStateWriter);
	const gameSessionService: GameSessionService = new GameSessionServiceImpl(gameSessionClient, turnStartService, localStateAccess, gameStateWriter);
	const turnEndService: TurnEndService = new TurnEndServiceImpl(gameSessionService, movementService, gameStateWriter, localStateAccess);
	const settlementService: SettlementService = new SettlementServiceImpl(commandService, gameClient, localStateAccess);
	const tileService: TileService = new TileServiceImpl(localStateAccess, gameStateWriter);
	const cameraService: CameraService = new CameraServiceImpl(localStateAccess, gameStateWriter);
	const userService: UserService = new UserService(userClient, localStateAccess, gameStateWriter);

	// rendering
	const changeProvider: ChangeProvider = new GameChangeProvider(localStateAccess);
	const gameRenderer: GameRenderer = new GameRenderer(changeProvider, localStateAccess);

	// utility services
	const audioService: AudioService = new AudioService();

	// interface services
	export const interfaceService: InterfaceService = new InterfaceServiceImpl(
		gameRenderer,
		tileService,
		cameraService,
		movementService,
		turnEndService,
		settlementService,
		gameSessionService,
		userService,
		gameStateWriter,
		audioService,
	);
	LocalStateHooks.initialize({
		gameSessionDatabase: gameSessionDatabase,
		tileDatabase: tileDatabase,
		commandDatabase: commandDatabase,
		settlementDatabase: settlementDatabase,
		worldObjectDatabase: worldObjectDatabase,
		countryDatabase: countryDatabase,
		routeDatabase: routeDatabase,
		cameraDatabase: cameraDatabase,
	});

}
