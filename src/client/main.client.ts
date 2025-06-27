import { flavors } from "shared/theme/catppuccin";
import { flavorManager } from "shared/theme/flavorManager";
import { spawnVisualPalette } from "shared/theme/parts";
import { setInterval } from "shared/utils/timers";
import "./lib/flavorInitializer";

{
    // Looping through all flavors for debugging :)
    let index = 0;
    setInterval(() => {
        flavorManager.setFlavor(flavors[index]);
        index = (index + 1) % flavors.size();
    }, 2500)
}

spawnVisualPalette(new Vector3(50, 25/2, 0), new Vector3(5, 25, 5));