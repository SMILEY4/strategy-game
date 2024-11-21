import {SessionRepository} from "../../state/repository/sessionRepository";
import {MapMode} from "../../models/base/mapMode";

export class MapService {

	private readonly repository: SessionRepository;

	constructor(repository: SessionRepository) {
		this.repository = repository;
	}

	public setMapMode(mode: MapMode) {
		this.repository.setMapMode(mode)
	}
}