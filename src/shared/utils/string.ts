export function pluralAnd(entries: string[]): string {
    if (entries.size() === 1) return entries[0];
    if (entries.size() === 2) return `${entries[0]} and ${entries[1]}`;
    const clone = [...entries];
    const last = entries.pop()!;
    return `${clone.join(", ")}, and ${last}`;
}

export function pluralOr(entries: string[]): string {
    if (entries.size() === 1) return entries[0];
    if (entries.size() === 2) return `${entries[0]} or ${entries[1]}`;
    const clone = [...entries];
    const last = entries.pop()!;
    return `${clone.join(", ")}, or ${last}`;
}