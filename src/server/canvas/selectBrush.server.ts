import { getUserData, playerJoin } from "server/userData";
import { BRUSH_ID_ATTRIBUTE, BrushId, remotes as brushRemotes } from "shared/brushes";
import { remotes as splashRemotes } from "shared/splashes";

brushRemotes.setBrush.connect((player, brush) => {
    setBrush(player, brush);
})

playerJoin.Connect((player, data) => {
    player.SetAttribute(BRUSH_ID_ATTRIBUTE, data.selectedBrush);
})

const random = new Random();
export function setBrush(player: Player, brush: BrushId) {
    const data = getUserData(player.UserId);
    data.selectedBrush = brush;
    splashRemotes.spawnSplashesOnPlayer.fireAll(player.UserId, random.NextInteger(5, 15));
    player.SetAttribute(BRUSH_ID_ATTRIBUTE, brush);
}