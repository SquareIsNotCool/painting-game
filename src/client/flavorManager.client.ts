import { flavorManager, remotes } from "shared/theme/flavorManager";

import("shared/theme/parts");
import("shared/theme/lighting");

remotes.updateFlavor.connect((flavor, skipTween) => {
    flavorManager.setFlavor(flavor, skipTween);
})

flavorManager.changed.Connect(flavor => {
    remotes.setFlavor.fire(flavor.id);
})