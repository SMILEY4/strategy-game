/**
 * Html element pool for a specific category (all based on same template element)
 */
export interface PooledHtmlElementData {
	elements: HTMLElement[];
	templateElement: HTMLElement | null;
}