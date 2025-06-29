import { Workspace } from "@rbxts/services";
import { brushes, remotes, selectableBrushes } from "shared/brushes";
import { spawnTestBrushTriggers } from "shared/canvas";
import { spawnTestFlavorTriggers, spawnVisualPalette } from "shared/theme/parts";

// {
//     // Looping through all flavors for debugging :)
//     let index = 0;
//     setInterval(() => {
//         flavorManager.setFlavor(flavors[index]);
//         index = (index + 1) % flavors.size();
//     }, 2500)
// }

// spawnVisualPalette(false, new Vector3(50, 15/2, 0), new Vector3(5, 15, 5));
// spawnVisualPalette(true, new Vector3(50, 2.5/2 + 15, 0), new Vector3(5, 2.5, 5));
spawnTestFlavorTriggers(
    new Vector3(-15, 5/2, 0),
    new Vector3(2, 5, 2),
    new Vector3(0, 0, 1),
    5
);

spawnTestBrushTriggers(
    new Vector3(25, 5/2, 0),
    new Vector3(2, 5, 2),
    new Vector3(0, 0, 1),
    2.5
)
