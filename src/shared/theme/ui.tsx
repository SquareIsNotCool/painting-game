import Roact, { Binding, Children, Component, PropsWithChildren, PureComponent } from "@rbxts/roact";
import { flavorManager } from "./flavorManager";
import { FlavorInfo } from "./catppuccin";
import { $print } from "rbxts-transform-debug";

export function useFlavor(): [Binding<typeof flavorManager>, RBXScriptConnection] {
    const [state, setState] = Roact.createBinding(flavorManager);

    const connection = flavorManager.changed.Connect(() => {
        setState(flavorManager);
    })

    return [state, connection];
}