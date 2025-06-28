import { Client, createRemotes, loggerMiddleware, remote, Server } from "@rbxts/remo";
import { t } from "@rbxts/t";
import { $print } from "rbxts-transform-debug";
import { Flavor, getFlavor, FlavorInfo, flavors, getInverse, LabelWithInverse, Label } from "shared/theme/catppuccin";

class FlavorManager {
    private currentFlavor: FlavorInfo;
    private inverseFlavor: FlavorInfo;
    private changedEvent: BindableEvent<(flavor: FlavorInfo) => void> = new Instance("BindableEvent");
    public changed = this.changedEvent.Event;

    constructor(defaultFlavor: Flavor) {
        this.changedEvent.Name = "FlavorChanged";
        this.currentFlavor = getFlavor(defaultFlavor);
        this.inverseFlavor = getInverse(this.currentFlavor.id);
    }

    public setFlavor(id: Flavor) {
        if (id === this.currentFlavor.id) return;
        this.currentFlavor = getFlavor(id);
        this.inverseFlavor = getInverse(this.currentFlavor.id);
        this.changedEvent.Fire(this.currentFlavor);
    }
    public getFlavor(): FlavorInfo {
        return this.currentFlavor;
    }
    public getInverse(): FlavorInfo {
        return this.inverseFlavor;
    }
    public getColor(label: LabelWithInverse): Color3 {
        if (label.sub(0, "Inverse".size()) === "Inverse") {
            return this.inverseFlavor.colors[label.sub("Inverse".size() + 1) as Label];
        }
        return this.currentFlavor.colors[label as Label];
    }
}

export const flavorManager = new FlavorManager("frappe");

export const remotes = createRemotes({
    updateFlavor: remote<Client, [flavor: Flavor]>(t.valueOf(flavors)),
    setFlavor: remote<Server, [flavor: Flavor]>(t.valueOf(flavors))
}, loggerMiddleware);