import { Flavor, getFlavor, FlavorInfo } from "shared/theme/catppuccin";

class FlavorManager {
    private currentFlavor: FlavorInfo;
    private changedEvent: BindableEvent<(flavor: FlavorInfo) => void> = new Instance("BindableEvent");
    public changed = this.changedEvent.Event;

    constructor(defaultFlavor: Flavor) {
        this.changedEvent.Name = "FlavorChanged";
        this.currentFlavor = getFlavor(defaultFlavor);
    }

    public setFlavor(id: Flavor) {
        if (id === this.currentFlavor.id) return;
        this.currentFlavor = getFlavor(id);
        this.changedEvent.Fire(this.currentFlavor);
    }
    public getFlavor(): FlavorInfo {
        return this.currentFlavor;
    }
}

export const flavorManager = new FlavorManager("frappe");