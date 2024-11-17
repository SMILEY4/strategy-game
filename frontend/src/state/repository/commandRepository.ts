import {CommandDatabase} from "../database/commandDatabase";
import {Command, CommandType} from "../../models/base/command";

export class CommandRepository {

	private readonly commandDb: CommandDatabase;

	constructor(commandDb: CommandDatabase) {
		this.commandDb = commandDb;
	}

	public getAll(): Command[] {
		return this.commandDb.queryMany(CommandDatabase.QUERY_ALL, null);
	}

	public getAllByType<T extends Command>(type: CommandType): T[] {
		return this.getAll()
			.filter(it => it.type === CommandType.PRODUCTION_QUEUE_ADD)
			.map(it => it as T)
	}

	public add(command: Command) {
		this.commandDb.insert(command);
	}

	public remove(commandId: string) {
		this.commandDb.delete(commandId);
	}

	public clear() {
		this.commandDb.deleteAll();
	}

}