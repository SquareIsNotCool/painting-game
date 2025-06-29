import { $error } from "rbxts-transform-debug"

export function getRightAndDownVectorsFromNormalAcrossPrimaryAxis(normal: Vector3): { right: Vector3, down: Vector3 } {
    if (normal.Magnitude !== 1) $error(`The normal (${normal}) is not normalized!`);
    if (normal.X ===  1) return { right: new Vector3( 0, 0, -1), down: new Vector3(0, -1,  0) }
    if (normal.X === -1) return { right: new Vector3( 0, 0,  1), down: new Vector3(0, -1,  0) }
    if (normal.Y ===  1) return { right: new Vector3( 1, 0,  0), down: new Vector3(0,  0,  1) }
    if (normal.Y === -1) return { right: new Vector3( 1, 0,  0), down: new Vector3(0,  0, -1) }
    if (normal.Z ===  1) return { right: new Vector3( 1, 0,  0), down: new Vector3(0, -1,  0) }
    if (normal.Z === -1) return { right: new Vector3(-1, 0,  0), down: new Vector3(0, -1,  0) }
    $error(`The normal (${normal}) does not point along any primary axes!`);
}