// Input: Array<标识，任务>
// Output: Array<错误?, 标识, 结果, 耗时>
export async function invokeAll<K, T>(tasks: [K, Promise<T>][]): Promise<[Error, K, T, number][]> {
    return await Promise.all(tasks.map(task => {
        const [input, run] = task;
        const t0 = Date.now();
        return run
            .then(output => [null, input, output, Date.now() - t0] as [Error, K, T, number])
            .catch(err => [err, input, null, Date.now() - t0] as [Error, K, T, number]);
    }));
}
