import { remotes } from "shared/theme/flavorManager";
import { getUserData, playerJoin } from "./userData";

remotes.setFlavor.connect((player, flavor) => {
    const data = getUserData(player.UserId);
    data.selectedFlavor = flavor;
});

playerJoin.Connect((player, data) => {
    remotes.updateFlavor.fire(player, data.selectedFlavor, true);
})