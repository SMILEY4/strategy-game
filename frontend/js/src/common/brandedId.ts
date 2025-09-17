/**
 * Base of an object identifier.
 *
 * Provides a bit more type-safety.
 * WARNING: can still be accidentally cast to the base type:
 * 		 const myId: BrandedI<string, "MyId">;
 * 		 const x: string = myId // no error here
 *
 * Example:
 * 		"type UserId = Id<string, 'UserId'>;" create a typesafe identifier for users.
 */
export type BrandedId<T, B> = T & { __brand: B}