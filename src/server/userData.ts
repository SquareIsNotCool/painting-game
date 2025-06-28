import { DataStoreService, Players } from "@rbxts/services";
import { $warn } from "rbxts-transform-debug";
import { Flavor } from "shared/theme/catppuccin";

const store = DataStoreService.GetDataStore("UserData");

const handlePlayerJoin = new Instance("BindableEvent") as BindableEvent<(player: Player, data: UserData) => void>;
export const playerJoin = handlePlayerJoin.Event;

type UserId = number;
interface UserData {
    selectedFlavor: Flavor
}

const userData: Record<UserId, UserData> = {};

const defaultData = () => ({
    selectedFlavor: "frappe"
} satisfies UserData)

const getKey = (player: Player) => `${player.UserId}`;
async function getData(player: Player): Promise<UserData | undefined> {
    return new Promise((resolve, reject) => {
        task.spawn(() => {
            try {
                resolve(store.GetAsync<UserData>(getKey(player))[0]);
            } catch (error) {
                reject(error);
            }
        })
    })
}
async function setData(player: Player, data: UserData): Promise<string> {
    return new Promise((resolve, reject) => {
        task.spawn(() => {
            try {
                resolve(store.SetAsync(getKey(player), data, [player.UserId]));
            } catch (error) {
                reject(error);
            }
        })
    })
}

Players.PlayerAdded.Connect(async player => {
    const data = (await getData(player)) ?? defaultData();
    userData[player.UserId] = data;
    handlePlayerJoin.Fire(player, data);
})
Players.PlayerRemoving.Connect(async player => {
    const data = userData[player.UserId];
    delete userData[player.UserId];
    setData(player, data);
})

export function getUserData(userId: UserId) {
    return userData[userId];
}