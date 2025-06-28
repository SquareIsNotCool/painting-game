import { flavorManager, remotes } from "shared/theme/flavorManager";

import("shared/theme/parts");
import("shared/theme/lighting");

remotes.updateFlavor.connect(flavor => {
    flavorManager.setFlavor(flavor);
})

flavorManager.changed.Connect(flavor => {
    remotes.setFlavor.fire(flavor.id);
})