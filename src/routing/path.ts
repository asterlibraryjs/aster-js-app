import { Query } from "@aster-js/iterators";
import { RoutingConstants } from "./routing-constants";

export type PathParsingOptions = {
    readonly separator?: string;
    readonly relativeIndicator?: string;
}

const SEGMENT_SEPARATOR = "/";

/**
 * Helper class for working with URL paths.
 */
export class Path implements Iterable<string>{
    /**
     * An empty path.
     */
    static readonly empty = new Path([]);

    /**
     * Gets the count of segments in current path.
     */
    get length(): number { return this._segments.length; }

    /**
     * Gets whether the current path is relative.
     */
    get relative(): boolean { return this._relative ?? false; }

    private constructor(
        private readonly _segments: readonly string[],
        private readonly _relative?: true
    ) { }

    /**
     * Returns the segment at the specified index.
     * @param idx Index to get the segment at.
     */
    getAt(idx: number): string | undefined {
        return this._segments[idx];
    }

    /**
     * Returns whether or not current path start with the provided path.
     * @param path Path to compare with.
     * @param options Options use to parse the path to compare with.
     */
    startsWith(path: string, options?: PathParsingOptions): boolean;
    /**
     * Returns whether or not current path start with the same sequence of segments
     * @param path Path to compare with.
     */
    startsWith(path: Path): boolean;
    startsWith(pathOrSegments: string | Path, options?: PathParsingOptions): boolean {
        const path = pathOrSegments instanceof Path
            ? pathOrSegments
            : Path.parse(pathOrSegments, options);

        if (path.length > this.length) return false;

        return path._segments.every((segment, idx) => segment === this._segments[idx]);
    }

    /**
     * Returns a slice of current path.
     * @param start Offset to start the slice at.
     * @param end Last index to include in the slice.
     */
    slice(start: number, end?: number): Path {
        return new Path(this._segments.slice(start, end));
    }

    /**
     * Combine current path with the specified path.
     * @param path Path to combine with.
     * @param options Options use to parse the path to compare with.
     */
    combine(path: string, options?: PathParsingOptions): Path;
    combine(path: Path): Path;
    combine(path: string | Path, options?: PathParsingOptions): Path {
        if (path instanceof Path) return new Path([...this, ...path], this._relative);
        return new Path([...this, ...Path.parse(path, options)], this._relative);
    }

    toString(): string {
        return Path.join(this._segments);
    }

    equals(other: Path): boolean {
        return this._segments.length === other._segments.length
            && this._segments.every((segment, idx) => segment === other._segments[idx]);
    }

    [Symbol.iterator](): Iterator<string> {
        return this._segments[Symbol.iterator]();
    }

    /** Parses the specified path into a Path instance. */
    static parse(path: string, options?: PathParsingOptions): Path {
        const segments = Path.split(path, options?.separator);

        if(segments.length === 0) return Path.empty;

        if (segments[0] === (options?.relativeIndicator || RoutingConstants.RELATIVE_URL_CHAR)) {
            return new Path(segments.slice(1), true);
        }
        return new Path(segments);
    }

    /** Trims the specified path by removing starting and ending separators. */
    static trim(path: string): string {
        const offset = path.startsWith(SEGMENT_SEPARATOR) ? 1 : 0;
        const length = path.endsWith(SEGMENT_SEPARATOR) ? path.length - 1 : path.length;
        return path.substring(offset, length);
    }

    /** Splits the specified path into segments. */
    static split(path: string, separator?: string): string[] {
        return path
            .split(separator || SEGMENT_SEPARATOR)
            .filter(Boolean)
            .map(decodeURIComponent);
    }

    /** Joins the specified segments into a path. */
    static join(segments: readonly string[]): string {
        if(segments.length === 0) return SEGMENT_SEPARATOR;

        const builder = Query(segments)
            .map(x => this.trim(x));
        return SEGMENT_SEPARATOR + builder.toArray().join(SEGMENT_SEPARATOR) + SEGMENT_SEPARATOR;
    }

    /** Returns whether the specified path is empty. */
    static isEmpty(path: string): boolean {
        return !path || path === SEGMENT_SEPARATOR;
    }
}
