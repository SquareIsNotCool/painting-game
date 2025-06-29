export function easeOutExpo(x: number): number {
    return x === 1 ? 1 : 1 - math.pow(2, -10 * x);
}