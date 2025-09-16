import {TileService, TileServiceImpl} from "./logic/game/service/tileService";
import {CameraService, CameraServiceImpl} from "./logic/game/service/cameraService";
import {MovementService, MovementServiceImpl} from "./logic/game/service/movementService";
import {TurnEndService, TurnEndServiceImpl} from "./logic/game/service/turnEndService";
import {SettlementService, SettlementServiceImpl} from "./logic/game/service/settlementService";
import {GameStateWriter, GameStateWriterImpl} from "./state/gameStateWriter";
import {AudioService} from "./common/audioService";
import {GameStateAccess, GameStateAccessImpl} from "./state/gameStateAccess";
import {CameraDatabase} from "./state/database/cameraDatabase";
import {CommandDatabase} from "./state/database/commandDatabase";
import {RealmDatabase} from "./state/database/realmDatabase";
import {GameSessionDatabase} from "./state/database/gameSessionDatabase";
import {TileDatabase} from "./state/database/tileDatabase";
import {WorldObjectDatabase} from "./state/database/worldObjectDatabase";
import {GameClient} from "./logic/game/client/gameClient";
import {HttpClient} from "./common/httpClient";
import {CommandService, CommandServiceImpl} from "./logic/game/service/commandService";
import {GameSessionService, GameSessionServiceImpl} from "./logic/game/service/gameSessionService";
import {GameSessionClient} from "./logic/game/client/gameSessionClient";
import {WebsocketClient} from "./common/websocketClient";
import {TurnStartService, TurnStartServiceImpl} from "./logic/game/service/turnStartService";
import {UserService, UserServiceImpl} from "./logic/user/service/userService";
import {UserClient} from "./logic/user/client/userClient";
import {GameStateHooks} from "./state/gameStateHooks";
import {UserStateWriter, UserStateWriterImpl} from "./state/userStateWriter";
import {UserStateAccess, UserStateAccessImpl} from "./state/userStateAccess";
import {GameProxy, GameProxyImpl} from "./logic/game/gameProxy";
import {UserProxy, UserProxyImpl} from "./logic/user/userProxy";
import {WebGLMonitor} from "./common/webgl/monitor/webGLMonitor";
import {MonitoringService, MonitoringServiceImpl} from "./logic/game/service/monitoringService";
import {GLError} from "./common/webgl/glError";
import {GameRenderer} from "./renderer/gameRenderer";
import {GameChangeTracker} from "./renderer/gameChangeTracker";
import {GameShaderSourceManager} from "./renderer/gameShaderSourceManager";
import {GameTextureAtlasDataManager} from "./renderer/gameTextureAtlasDataManager";

const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;
const ENABLE_WEBGL_ERROR_CHECKING: boolean = import.meta.env.PUB_ENABLE_WEBGL_ERROR_CHECKING === "true";
const ENABLE_RENDERER_MONITORING: boolean = import.meta.env.PUB_ENABLE_RENDERER_MONITORING === "true";

export namespace App {

	console.log("initializing app dependencies.", API_BASE_URL, API_WS_BASE_URL, ENABLE_WEBGL_ERROR_CHECKING, ENABLE_RENDERER_MONITORING)

	GLError.enabled = ENABLE_WEBGL_ERROR_CHECKING;
	WebGLMonitor.enabled = ENABLE_RENDERER_MONITORING;

	// database
	const cameraDatabase: CameraDatabase = new CameraDatabase();
	const commandDatabase: CommandDatabase = new CommandDatabase();
	const realmDatabase: RealmDatabase = new RealmDatabase();
	const gameSessionDatabase: GameSessionDatabase = new GameSessionDatabase();
	const tileDatabase: TileDatabase = new TileDatabase();
	const worldObjectDatabase: WorldObjectDatabase = new WorldObjectDatabase();

	// state read / write
	const userStateAccess: UserStateAccess = new UserStateAccessImpl();
	const userStateWriter: UserStateWriter = new UserStateWriterImpl();
	const gameStateAccess: GameStateAccess = new GameStateAccessImpl(
		cameraDatabase,
		tileDatabase,
		gameSessionDatabase,
		realmDatabase,
		worldObjectDatabase,
		commandDatabase,
	);
	const gameStateWriter: GameStateWriter = new GameStateWriterImpl(
		commandDatabase,
		tileDatabase,
		realmDatabase,
		worldObjectDatabase,
		cameraDatabase,
		gameSessionDatabase,
	);

	// api clients
	const httpClient: HttpClient = new HttpClient(API_BASE_URL);
	const userClient: UserClient = new UserClient(httpClient, userStateAccess);
	const gameClient: GameClient = new GameClient(httpClient, userStateAccess, gameStateAccess);
	const gameSessionClient: GameSessionClient = new GameSessionClient(httpClient, new WebsocketClient(API_WS_BASE_URL), userStateAccess);

	// misc services
	const webglMonitor: WebGLMonitor = new WebGLMonitor();

	// core services
	const commandService: CommandService = new CommandServiceImpl(gameStateWriter);
	const movementService: MovementService = new MovementServiceImpl(gameStateAccess, gameStateWriter, gameClient, commandService);
	const turnStartService: TurnStartService = new TurnStartServiceImpl(gameStateWriter);
	const cameraService: CameraService = new CameraServiceImpl(gameStateAccess, gameStateWriter);
	const gameSessionService: GameSessionService = new GameSessionServiceImpl(gameSessionClient, turnStartService, cameraService, gameStateAccess, gameStateWriter);
	const turnEndService: TurnEndService = new TurnEndServiceImpl(gameSessionService, movementService, gameStateWriter, gameStateAccess);
	const settlementService: SettlementService = new SettlementServiceImpl(commandService, gameClient, gameStateAccess);
	const tileService: TileService = new TileServiceImpl(gameStateAccess, gameStateWriter);
	const userService: UserService = new UserServiceImpl(userClient, userStateAccess, userStateWriter);
	const monitoringService: MonitoringService = new MonitoringServiceImpl(webglMonitor);

	// rendering
	const changeTracker: GameChangeTracker = new GameChangeTracker(gameStateAccess);
	const shaderSourceManager: GameShaderSourceManager = new GameShaderSourceManager();
	const textureAtlasDataManager: GameTextureAtlasDataManager = new GameTextureAtlasDataManager();
	const gameRenderer: GameRenderer = new GameRenderer(gameStateAccess, changeTracker, shaderSourceManager, textureAtlasDataManager);

	// utility services
	const audioService: AudioService = new AudioService();

	// proxy services
	export const userProxy: UserProxy = new UserProxyImpl(
		userService,
	);
	export const gameProxy: GameProxy = new GameProxyImpl(
		gameRenderer,
		tileService,
		cameraService,
		movementService,
		turnEndService,
		settlementService,
		commandService,
		monitoringService,
		gameSessionService,
		gameStateWriter,
		audioService,
	);
	GameStateHooks.initialize({
		gameSessionDatabase: gameSessionDatabase,
		tileDatabase: tileDatabase,
		commandDatabase: commandDatabase,
		worldObjectDatabase: worldObjectDatabase,
		countryDatabase: realmDatabase,
		cameraDatabase: cameraDatabase,
	});

}
