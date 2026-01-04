export class AsyncResultStream<TResult> implements AsyncIterable<TResult> {

    constructor(private readonly _result: any) { }

    async *[Symbol.asyncIterator](): AsyncIterator<TResult> {
        let result = this._result;
        if(!result) return;

        if (result instanceof Promise) {
            result = await result;
        }

        if (!result) return;

        if (Reflect.has(result, Symbol.iterator)) {
            for (const item of <Iterable<TResult>>result) {
                yield item;
            }
        }

        if (Reflect.has(result, Symbol.asyncIterator)) {
            for await (const item of <AsyncIterable<TResult>>result) {
                yield item;
            }
        }

        yield <TResult>result;
    }
}