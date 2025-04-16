/** Values extracted from the url search */
export type SearchValues = { readonly [k: string]: string | ReadonlyArray<string> | undefined; }

export namespace SearchValues {

    export const empty: SearchValues = Object.freeze({});

    export function merge(left: SearchValues, right: SearchValues): SearchValues {
        const result = structuredClone({ ...left, ...right });
        return Object.freeze(result);
    }

    /** Parse and map a query search into a QueryValues bag */
    export function parse(search: string): SearchValues {
        const result: Record<string, string | string[]> = {};

        const searchParams = new URLSearchParams(search);

        if (searchParams.size === 0) return empty;

        for (const [key, value] of searchParams) {
            if (Reflect.has(result, key)) {
                const current = result[key];
                if (isArray(current)) {
                    current.push(value);
                }
                else {
                    result[key] = [current, value];
                }
            }
            else {
                result[key] = value;
            }
        }

        return Object.freeze(result);
    }

    /** @deprecated use stringify */
    export function toString(query: SearchValues, sort?: boolean): string {
        return stringify(query, sort);
    }

    export function stringify(query: SearchValues, sort?: boolean): string {
        const search = new URLSearchParams();
        const entries = Object.entries(query);

        for (const [key, value] of entries) {
            if (typeof value === "undefined") continue;

            if (isArray(value)) {
                for (const v of value) {
                    search.append(key, v);
                }
            }
            else {
                search.append(key, value);
            }
        }

        if (sort) search.sort();
        return search.toString();
    }

    export function areEquals(first: SearchValues, second: SearchValues): boolean {
        const firstEntries = Object.entries(first);
        const secondKeys = Object.keys(second);

        if (firstEntries.length !== secondKeys.length) return false;

        if (firstEntries.length === 0) return true;

        for (const [key, firstValue] of firstEntries) {
            const secondValue = second[key];

            if (firstValue === secondValue) continue;

            if (isArray(firstValue) && isArray(secondValue) && firstValue.length === secondValue.length) {
                const firstSet = new Set(firstValue);
                if (secondValue.every(x => firstSet.has(x))) continue;
            }

            return false;
        }
        return true;
    }

    function isArray(value: string | readonly string[] | undefined): value is readonly string[] {
        return Array.isArray(value);
    }
}
