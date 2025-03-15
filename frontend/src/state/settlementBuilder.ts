import {HiddenType} from "../common/hiddenType";
import {ProductionQueueEntryEntity, SettlementEntity} from "../models/settlement/settlementEntity";
import {
	Settlement,
	SettlementProductionOption,
	SettlementProductionQueueEntry,
} from "../models/settlement/settlement";
import visible = HiddenType.visible;
import hidden = HiddenType.hidden;
import {RouteEntity} from "../models/route/routeEntity";
import {Command, ProductionQueueAddCommand, ProductionQueueCancelCommand} from "../models/command/command";
import {CommandType} from "../models/command/commandType";

export namespace SettlementBuilder {

	export function buildSettlement(settlement: SettlementEntity, routes: RouteEntity[], settlements: SettlementEntity[], commands: Command[]): Settlement {
		return {
			id: settlement.id,
			name: settlement.name,
			color: settlement.color,
			country: settlement.country,
			tile: settlement.tile,
			population: {
				size: visible({
					size: settlement.population.size,
				}),
				growth: settlement.population.growth.visible
					? visible({
						totalProgress: settlement.population.growth.value.progress,
						lastProgress: settlement.population.growth.value.amount,
						expectedPopulationSizeChange: settlement.population.growth.value.progress >= 0 ? +1 : -1,
						details: settlement.population.growth.value.details,
					})
					: hidden(),
			},
			routes: routes
				.filter(route => route.settlementA.id === settlement.id || route.settlementB.id === settlement.id)
				.map(route => {
					const targetSettlementId = (settlement.id === route.settlementA.id) ? route.settlementB : route.settlementA;
					return {
						id: route.id,
						targetSettlement: targetSettlementId,
						targetCountry: settlements.find(settlement => settlement.id === targetSettlementId.id)!.country,
					};
				}),
			resources: settlement.resources,
			buildings: settlement.buildings,
			productionQueueActive: settlement.productionQueue.visible
				? visible(buildProductionQueueActive(settlement, settlement.productionQueue.value, commands))
				: hidden(),
		};
	}

	export function buildProductionQueue(settlement: SettlementEntity, commands: Command[]): SettlementProductionQueueEntry[] {
		if (!settlement.productionQueue.visible) {
			return [];
		}
		const queue: SettlementProductionQueueEntry[] = [];

		// add queue from last turn without cancelled entries
		queue.push(
			...settlement.productionQueue.value
				.filter(entry => !isProductionQueueEntryCancelled(entry, commands))
				.map(entry => ({
					type: entry.type,
					id: entry.entryId,
					progress: entry.progress,
					isCommand: false,
				})),
		);

		// add pending entries from commands
		queue.push(
			...commands
				.filter(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_ADD && (cmd as ProductionQueueAddCommand).settlement.id === settlement.id)
				.map(cmd => cmd as ProductionQueueAddCommand)
				.map(cmd => ({
					type: cmd.entry.type,
					id: cmd.entry.entryId,
					progress: cmd.entry.progress,
					isCommand: true,
				})),
		);

		return queue;
	}

	export function buildProductionOptions(settlement: SettlementEntity, commands: Command[]): SettlementProductionOption[] {
		const baseOptions = settlement.productionOptions.visible ? settlement.productionOptions.value : [];
		const currentProductionQueue = SettlementBuilder.buildProductionQueue(settlement, commands)

		return baseOptions.map(baseOption => {

			let queueCount = 0;
			let commandCount = 0;
			for (let queueEntry of currentProductionQueue) {
				if (queueEntry.type === baseOption.type) {
					if (queueEntry.isCommand) {
						commandCount++;
					} else {
						queueCount++;
					}
				}
			}

			let available = true;
			if (baseOption.requiresTile && baseOption.availableTiles <= queueCount + commandCount) {
				available = false;
			}

			return {
				type: baseOption.type,
				available: available,
				queueCount: queueCount,
				commandCount: commandCount
			}
		})
	}


	function buildProductionQueueActive(settlement: SettlementEntity, productionQueue: ProductionQueueEntryEntity[], commands: Command[]): SettlementProductionQueueEntry | null {
		const queueWithoutCancelled = productionQueue.filter(entry => !isProductionQueueEntryCancelled(entry, commands));
		if (queueWithoutCancelled) {
			return {
				type: queueWithoutCancelled[0].type,
				id: queueWithoutCancelled[0].entryId,
				progress: queueWithoutCancelled[0].progress,
				isCommand: false,
			};
		} else {
			const firstAddCommand = commands.find(it => it.type === CommandType.PRODUCTION_QUEUE_ADD && (it as ProductionQueueAddCommand).settlement.id === settlement.id) as ProductionQueueAddCommand;
			if (firstAddCommand) {
				return {
					type: firstAddCommand.entry.type,
					id: firstAddCommand.entry.entryId,
					progress: firstAddCommand.entry.progress,
					isCommand: true,
				};
			}
		}
		return null;
	}

	function isProductionQueueEntryCancelled(entry: ProductionQueueEntryEntity, commands: Command[]): boolean {
		return commands.some(cmd => cmd.type === CommandType.PRODUCTION_QUEUE_CANCEL && (cmd as ProductionQueueCancelCommand).entry.entryId === entry.entryId);
	}

}