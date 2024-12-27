import {
	ProductionOptionAggregate, RouteAggregate,
	SettlementAggregate,
} from "../models/aggregates/SettlementAggregate";
import {AppCtx} from "../appContext";
import {useQueryMultiple, useQuerySingle} from "../common/db/adapters/databaseHooks";
import {SettlementDatabase} from "./database/settlementDatabase";
import {CommandDatabase} from "./database/commandDatabase";
import {CommandType, ProductionQueueAddCommand, ProductionQueueCancelCommand} from "../models/base/command";
import {ProductionQueueEntry} from "../models/base/Settlement";
import {ProductionOption} from "../models/base/productionOption";
import {getHiddenOrDefault} from "../common/hiddenType";
import {RouteDatabase} from "./database/routeDatabase";
import {Route} from "../models/base/route";

export namespace SettlementAggregateAccess {

	export function useSettlementAggregate(settlementId: string | null): SettlementAggregate | null {

		const settlement = useQuerySingle(AppCtx.SettlementDatabase(), SettlementDatabase.QUERY_BY_ID, settlementId);
		const commands = useQueryMultiple(AppCtx.CommandDatabase(), CommandDatabase.QUERY_ALL, null);
		const routes = useQueryMultiple(AppCtx.RouteDatabase(), RouteDatabase.QUERY_BY_SETTLEMENT, settlementId)

		if (settlementId == null || settlement == null) {
			return null;
		}

		const addProductionQueueCommands = commands
			.filter(it => it.type === CommandType.PRODUCTION_QUEUE_ADD)
			.map(it => it as ProductionQueueAddCommand)
			.filter(it => it.settlement.id === settlementId);

		const cancelProductionQueueCommands = commands
			.filter(it => it.type === CommandType.PRODUCTION_QUEUE_CANCEL)
			.map(it => it as ProductionQueueCancelCommand)
			.filter(it => it.settlement.id === settlementId);

		const productionQueue = buildQueueEntries(getHiddenOrDefault(settlement.productionQueue, []), addProductionQueueCommands, cancelProductionQueueCommands);
		const productionOptions = buildProductionOptions(getHiddenOrDefault(settlement.productionOptions, []), productionQueue);

		return {
			identifier: settlement.identifier,
			country: settlement.country,
			tile: settlement.tile,
			population: settlement.population,
			production: {
				options: productionOptions,
				queue: productionQueue,
			},
			buildings: getHiddenOrDefault(settlement.buildings, []),
			resources: getHiddenOrDefault(settlement.resources, []),
			routes: routes.map(route => buildRoute(route)),
		};

		function buildQueueEntries(
			productionQueue: ProductionQueueEntry[],
			addProductionQueueCommands: ProductionQueueAddCommand[],
			cancelProductionQueueCommands: ProductionQueueCancelCommand[],
		): ProductionQueueEntry[] {
			return [
				...productionQueue
					.filter(entry => !isCancelled(entry, cancelProductionQueueCommands))
					.map(entry => ({
						type: entry.type,
						entryId: entry.entryId,
						progress: entry.progress,
						isCommand: false,
					})),
				...addProductionQueueCommands
					.map(command => ({
						type: command.entry.type,
						entryId: command.id,
						progress: 0,
						isCommand: true,
					})),
			];
		}

		function isCancelled(entry: ProductionQueueEntry, cancelProductionQueueCommands: ProductionQueueCancelCommand[]): boolean {
			return cancelProductionQueueCommands.some(it => it.entry.entryId === entry.entryId);
		}


		function buildProductionOptions(
			options: ProductionOption[],
			productionQueue: ProductionQueueEntry[],
		): ProductionOptionAggregate[] {
			return options.map(it => buildProductionOption(it, productionQueue));
		}

		function buildProductionOption(
			option: ProductionOption,
			productionQueue: ProductionQueueEntry[],
		): ProductionOptionAggregate {

			let queueCount = 0;
			let commandCount = 0;

			for (let queueEntry of productionQueue) {
				if (queueEntry.type === option.type) {
					if (queueEntry.isCommand) {
						commandCount++;
					} else {
						queueCount++;
					}
				}
			}

			let available = true;
			if (option.requiresTile && option.availableTiles <= queueCount + commandCount) {
				available = false;
			}

			return {
				type: option.type,
				queueCount: queueCount,
				commandCount: commandCount,
				available: available,
			};
		}

		function buildRoute(route: Route): RouteAggregate {
			const targetSettlementId = route.settlementA.id === settlementId ? route.settlementB : route.settlementA;
			const targetSettlement = AppCtx.SettlementDatabase().queryById(targetSettlementId.id)!
			return {
				id: route.id,
				targetSettlement: targetSettlement.identifier,
				targetCountry: targetSettlement.country,
				path: route.path
			}
		}

	}


}