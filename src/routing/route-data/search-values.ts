/** Values extracted from the url search */
export type SearchValues = { readonly [k: string]: string | string[]; }

export namespace SearchValues {

    export const empty: SearchValues = Object.freeze({});

    /** Parse and map a query search into a QueryValues bag */
    export function parse(search: string): SearchValues {
        const result: Record<string, string | string[]> = {};

        const searchParams = new URLSearchParams(search);

        if (searchParams.size === 0) return empty;

        for (const [key, value] of searchParams) {
            if (Reflect.has(result, key)) {
                const current = result[key];
                if (Array.isArray(current)) {
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

    export function toString(query: SearchValues, sort?: boolean): string {
        const search = new URLSearchParams();
        const entries = Object.entries(query); search


        for (const [key, value] of entries) {
            if (Array.isArray(value)) {
                for (const v of value) {
                    search.append(key, v);
                }
            }
            else {
                search.append(key, value);
            }
        }

        if (search) search.sort();
        return search.toString();
    }

    export function areEquals(first: SearchValues, second: SearchValues): boolean {
        const firstEntries = Object.entries(first);
        const secondKeys = Object.keys(second);

        if (firstEntries.length !== secondKeys.length) return false;

        if (firstEntries.length === 0) return true;

        for (const [key, firstValue] of firstEntries) {
            const secondValue = second[key];

            if (typeof firstValue !== typeof secondValue) return false;

            if (Array.isArray(firstValue)) {
                if (!Array.isArray(secondValue) || firstValue.length !== secondValue.length) return false;

                const firstIndex = new Set(firstValue);
                for (const secondItem of secondValue) {
                    if (!firstIndex.has(secondItem)) return false;
                }
            }
            else {
                if (Array.isArray(secondValue)) return false;
                if (firstValue !== secondValue) return false;
            }
        }

        return true;
    }
}
