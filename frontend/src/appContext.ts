import {DIContext} from "./common/dependencyinjection/di";
import {HttpClient} from "./common/httpClient";
import {WebsocketClient} from "./common/websocketClient";
import {AuthProvider} from "./logic/user/authProvider";
import {TurnStartService} from "./logic/game/turnStartService";
import {UserService} from "./logic/user/userService";
import {GameSessionClient} from "./logic/gamesession/gameSessionClient";
import {GameSessionService} from "./logic/gamesession/gameSessionService";
import {GameLoopService} from "./logic/game/gameLoopService";
import {UserClient} from "./logic/user/userClient";
import {TilePicker} from "./logic/game/tilePicker";
import {AudioService} from "./common/audioService";
import {WebGLMonitor} from "./common/webgl/monitor/webGLMonitor";
import {CameraDatabase} from "./state/database/cameraDatabase";
import {GameSessionDatabase} from "./state/database/gameSessionDatabase";
import {TileDatabase} from "./state/database/tileDatabase";
import {MonitoringRepository} from "./state/repository/monitoringRepository";
import {UserRepository} from "./state/repository/userRepository";
import {GameRenderer} from "./renderer/game/gameRenderer";
import {SessionRepository} from "./state/repository/sessionRepository";
import {TurnEndService} from "./logic/game/turnEndService";
import {WorldObjectDatabase} from "./state/database/objectDatabase";
import {MovementService} from "./logic/game/movementService";
import {CommandService} from "./logic/game/commandService";
import {CommandDatabase} from "./state/database/commandDatabase";
import {GameClient} from "./logic/game/gameClient";
import {GameIdProvider} from "./logic/gamesession/gameIdProvider";
import {CountryDatabase} from "./state/database/countryDatabase";
import {SettlementService} from "./logic/game/settlementService";
import {SettlementDatabase} from "./state/database/settlementDatabase";
import {ProvinceDatabase} from "./state/database/provinceDatabase";
import {CameraRepository} from "./state/repository/cameraRepository";
import {CommandRepository} from "./state/repository/commandRepository";
import {SettlementRepository} from "./state/repository/settlementRepository";
import {TileRepository} from "./state/repository/tileRepository";
import {TurnRepository} from "./state/repository/turnRepository";
import {WorldObjectRepository} from "./state/repository/worldObjectRepository";
import {ChangeProvider} from "./renderer/game/changeProvider";
import {ProvinceRepository} from "./state/repository/provinceRepository";


const API_BASE_URL = import.meta.env.PUB_BACKEND_URL;
const API_WS_BASE_URL = import.meta.env.PUB_BACKEND_WEBSOCKET_URL;


interface AppCtxDef {
	HttpClient: () => HttpClient,
	WebsocketClient: () => WebsocketClient,
	AudioService: () => AudioService,

	GameSessionClient: () => GameSessionClient,
	GameSessionService: () => GameSessionService,

	UserClient: () => UserClient,
	UserService: () => UserService,
	UserRepository: () => UserRepository,
	AuthProvider: () => AuthProvider,

	TurnStartService: () => TurnStartService,
	TurnEndService: () => TurnEndService,
	GameLoopService: () => GameLoopService,
	MovementService: () => MovementService,
	CommandService: () => CommandService,
	GameClient: () => GameClient,
	GameIdProvider: () => GameIdProvider,
	SettlementService: () => SettlementService,

	GameRenderer: () => GameRenderer,
	ChangeProvider: () => ChangeProvider,

	MonitoringRepository: () => MonitoringRepository,
	WebGLMonitor: () => WebGLMonitor,

	CameraRepository: () => CameraRepository,
	CommandRepository: () => CommandRepository,
	SettlementRepository: () => SettlementRepository,
	TileRepository: () => TileRepository,
	TurnRepository: () => TurnRepository,
	WorldObjectRepository: () => WorldObjectRepository,
	SessionRepository: () => SessionRepository,
	ProvinceRepository: () => ProvinceRepository,

	CameraDatabase: () => CameraDatabase,
	GameSessionDatabase: () => GameSessionDatabase,
	CommandDatabase: () => CommandDatabase,
	TileDatabase: () => TileDatabase,
	CountryDatabase: () => CountryDatabase,
	ProvinceDatabase: () => ProvinceDatabase,
	SettlementDatabase: () => SettlementDatabase,
	WorldObjectDatabase: () => WorldObjectDatabase,
}


const diContext = new DIContext();

export const AppCtx: AppCtxDef = {

	HttpClient: diContext.register(
		HttpClient.name,
		() => new HttpClient(API_BASE_URL),
	),
	WebsocketClient: diContext.register(
		WebsocketClient.name,
		() => new WebsocketClient(API_WS_BASE_URL),
	),
	AudioService: diContext.register(
		"AudioService",
		() => new AudioService(),
		{
			creation: "eager",
			lifetime: "singleton",
		},
	),


	GameSessionClient: diContext.register(
		GameSessionClient.name,
		ctx => new GameSessionClient(
			ctx.get<AuthProvider>(AuthProvider.name),
			ctx.get<HttpClient>(HttpClient.name),
			ctx.get<WebsocketClient>(WebsocketClient.name),
		),
	),
	GameSessionService: diContext.register(
		GameSessionService.name,
		ctx => new GameSessionService(
			ctx.get<GameSessionClient>(GameSessionClient.name),
			ctx.get<SessionRepository>(SessionRepository.name),
			ctx.get<TurnStartService>(TurnStartService.name),
		),
	),

	AuthProvider: diContext.register(
		AuthProvider.name,
		ctx => new AuthProvider(
			ctx.get<UserRepository>(UserRepository.name),
		),
	),
	UserClient: diContext.register(
		UserClient.name,
		ctx => new UserClient(
			ctx.get<AuthProvider>(AuthProvider.name),
			ctx.get<HttpClient>(HttpClient.name),
		),
	),
	UserService: diContext.register(
		UserService.name,
		ctx => new UserService(
			ctx.get<UserClient>(UserClient.name),
			ctx.get<UserRepository>(UserRepository.name),
		),
	),


	TurnStartService: diContext.register(
		TurnStartService.name,
		ctx => new TurnStartService(
			ctx.get<MonitoringRepository>(MonitoringRepository.name),
			ctx.get<TurnRepository>(TurnRepository.name),
			ctx.get<CommandRepository>(CommandRepository.name),
		),
	),
	TurnEndService: diContext.register(
		TurnEndService.name,
		ctx => new TurnEndService(
			ctx.get<GameSessionService>(GameSessionService.name),
			ctx.get<MovementService>(MovementService.name),
			ctx.get<CommandRepository>(CommandRepository.name),
		),
	),
	GameLoopService: diContext.register(
		GameLoopService.name,
		ctx => new GameLoopService(
			ctx.get<MovementService>(MovementService.name),
			new TilePicker(
				ctx.get<TileRepository>(TileRepository.name),
				ctx.get<CameraRepository>(CameraRepository.name),
			),
			ctx.get<GameRenderer>(GameRenderer.name),
			ctx.get<AudioService>(AudioService.name),
			ctx.get<TileRepository>(TileRepository.name),
			ctx.get<WorldObjectRepository>(WorldObjectRepository.name),
			ctx.get<SettlementRepository>(SettlementRepository.name),
			ctx.get<CameraRepository>(CameraRepository.name),
		),
	),
	MovementService: diContext.register(
		MovementService.name,
		ctx => new MovementService(
			ctx.get<CommandService>(CommandService.name),
			ctx.get<GameClient>(GameClient.name),
			ctx.get<WorldObjectRepository>(WorldObjectRepository.name),
		),
	),
	CommandService: diContext.register(
		CommandService.name,
		ctx => new CommandService(
			ctx.get<AudioService>(AudioService.name),
			ctx.get<CommandRepository>(CommandRepository.name),
		),
	),
	GameClient: diContext.register(
		GameClient.name,
		ctx => new GameClient(
			ctx.get<AuthProvider>(AuthProvider.name),
			ctx.get<GameIdProvider>(GameIdProvider.name),
			ctx.get<HttpClient>(HttpClient.name),
		),
	),
	GameIdProvider: diContext.register(
		GameIdProvider.name,
		() => new GameIdProvider(),
	),
	SettlementService: diContext.register(
		SettlementService.name,
		ctx => new SettlementService(
			ctx.get<CommandService>(CommandService.name),
			ctx.get<GameClient>(GameClient.name),
			ctx.get<CommandRepository>(CommandRepository.name),
		),
	),

	WebGLMonitor: diContext.register(
		WebGLMonitor.name,
		() => new WebGLMonitor(),
	),
	GameRenderer: diContext.register(
		GameRenderer.name,
		ctx => new GameRenderer(
			ctx.get<ChangeProvider>(ChangeProvider.name),
			ctx.get<CameraRepository>(CameraRepository.name),
			ctx.get<TileRepository>(TileRepository.name),
			ctx.get<SessionRepository>(SessionRepository.name),
			ctx.get<WorldObjectRepository>(WorldObjectRepository.name),
			ctx.get<SettlementRepository>(SettlementRepository.name),
		),
	),
	ChangeProvider: diContext.register(
		ChangeProvider.name,
		ctx => new ChangeProvider(
			ctx.get<SessionRepository>(SessionRepository.name),
			ctx.get<WorldObjectRepository>(WorldObjectRepository.name),
		),
	),

	MonitoringRepository: diContext.register(
		MonitoringRepository.name,
		() => new MonitoringRepository(),
	),
	UserRepository: diContext.register(
		UserRepository.name,
		() => new UserRepository(),
	),


	CameraRepository: diContext.register(
		CameraRepository.name,
		ctx => new CameraRepository(
			ctx.get<CameraDatabase>(CameraDatabase.name),
		),
	),
	CommandRepository: diContext.register(
		CommandRepository.name,
		ctx => new CommandRepository(
			ctx.get<CommandDatabase>(CommandDatabase.name),
		),
	),
	SettlementRepository: diContext.register(
		SettlementRepository.name,
		ctx => new SettlementRepository(
			ctx.get<SettlementDatabase>(SettlementDatabase.name),
		),
	),
	TileRepository: diContext.register(
		TileRepository.name,
		ctx => new TileRepository(
			ctx.get<GameSessionDatabase>(GameSessionDatabase.name),
			ctx.get<TileDatabase>(TileDatabase.name),
		),
	),
	TurnRepository: diContext.register(
		TurnRepository.name,
		ctx => new TurnRepository(
			ctx.get<TileDatabase>(TileDatabase.name),
			ctx.get<WorldObjectDatabase>(WorldObjectDatabase.name),
			ctx.get<CommandDatabase>(CommandDatabase.name),
			ctx.get<CountryDatabase>(CountryDatabase.name),
			ctx.get<ProvinceDatabase>(ProvinceDatabase.name),
			ctx.get<SettlementDatabase>(SettlementDatabase.name),
		),
	),
	WorldObjectRepository: diContext.register(
		WorldObjectRepository.name,
		ctx => new WorldObjectRepository(
			ctx.get<WorldObjectDatabase>(WorldObjectDatabase.name),
			ctx.get<CommandDatabase>(CommandDatabase.name),
		),
	),
	SessionRepository: diContext.register(
		SessionRepository.name,
		ctx => new SessionRepository(
			ctx.get<GameSessionDatabase>(GameSessionDatabase.name),
		),
	),
	ProvinceRepository: diContext.register(
		ProvinceRepository.name,
		ctx => new ProvinceRepository(
			ctx.get<ProvinceDatabase>(ProvinceDatabase.name),
		)
	),


	CameraDatabase: diContext.register(
		CameraRepository.name,
		() => new CameraDatabase(),
	),
	GameSessionDatabase: diContext.register(
		GameSessionDatabase.name,
		() => new GameSessionDatabase(),
	),
	TileDatabase: diContext.register(
		TileDatabase.name,
		() => new TileDatabase(),
	),
	WorldObjectDatabase: diContext.register(
		WorldObjectDatabase.name,
		() => new WorldObjectDatabase(),
	),
	CommandDatabase: diContext.register(
		CommandDatabase.name,
		() => new CommandDatabase(),
	),
	CountryDatabase: diContext.register(
		CountryDatabase.name,
		() => new CountryDatabase(),
	),
	SettlementDatabase: diContext.register(
		SettlementDatabase.name,
		() => new SettlementDatabase(),
	),
	ProvinceDatabase: diContext.register(
		ProvinceDatabase.name,
		() => new ProvinceDatabase(),
	),
};

diContext.initialize();


export function useDI<T>(qualifier: string): T {
	return diContext.get<T>(qualifier)
}