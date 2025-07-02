import { $print } from "rbxts-transform-debug";

function toInt(value: number) {
    return math.floor(value * 256);
}

export function hashColor(color: Color3): number {
    return (toInt(color.R) << 16) | (toInt(color.G) << 8) | toInt(color.B)
}