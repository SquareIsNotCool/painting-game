import { Client, createRemotes, remote } from "@rbxts/remo";
import { allBrushIds, brushes, BrushId } from "./brushes";
import { t } from "@rbxts/t";

export interface SpawnSplash {
    position: Vector3,
    brush: BrushId
}

export const remotes = createRemotes({
    spawnSplashes: remote<Client, [splashes: SpawnSplash[]]>(t.array(t.interface({
        position: t.Vector3,
        brush: t.keyOf(brushes)
    }))),
    spawnSplashesOnPlayer: remote<Client, [player: number, count: number]>(t.integer, t.integer)
});