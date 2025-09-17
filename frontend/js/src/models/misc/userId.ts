import {BrandedId} from "../../common/brandedId";

export namespace User {

	export type Id = BrandedId<string, "UserId">;

}