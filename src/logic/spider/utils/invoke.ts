// Input: Array<标识，任务>
// Output: Array<错误?, 标识, 结果, 耗时>
export async function invokeAll<K, T>(tasks: [K, Promise<T>][]): Promise<[Error, K, T, Number][]> {
    return await Promise.all(tasks.map(task => {
        const [input, run] = task;
        const t0 = Date.now();
        return run
            .then(output => <[Error, K, T, number]>[null, input, output, Date.now() - t0])
            .catch(err => <[Error, K, T, number]>[err, input, null, Date.now() - t0]);
    }));
}
