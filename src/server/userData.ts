import { DataStoreService, Players } from "@rbxts/services";
import { $dbg, $print, $warn } from "rbxts-transform-debug";
import { Brush, BrushId } from "shared/brushes";
import { Flavor } from "shared/theme/catppuccin";

const store = DataStoreService.GetDataStore("UserData");

const handlePlayerJoin = new Instance("BindableEvent") as BindableEvent<(player: Player, data: UserData) => void>;
export const playerJoin = handlePlayerJoin.Event;

type UserId = number;
interface UserData {
    selectedFlavor: Flavor,
    selectedBrush: BrushId,
    // unlockedBrushes: Set<BrushId>
}

const userData: Record<UserId, UserData> = {};

const defaultData = () => ({
    selectedFlavor: "latte",
    selectedBrush: "blue",
    // unlockedBrushes: new Set(["blue"])
} satisfies UserData) as UserData;

function repairUserData<T extends object>(data: T, reference: T) {
    $dbg(data);
    $dbg(reference);
    const keys = new Set<keyof T>();
    for (const [k, v] of pairs(data as Record<string, unknown>)) {
        keys.add(k as keyof T);
    }
    for (const [k, v] of pairs(reference as Record<string, unknown>)) {
        keys.add(k as keyof T);
    }
    for (const key of keys) {
        if (key in data && !(key in reference)) {
            $print(`Deleting entry from userdata with key "${key as string}"`)
            delete data[key];
        }
        else if (!(key in data) && key in reference) {
            $print(`Copying entry from reference with key "${key as string}"`)
            data[key] = reference[key];
        }
        else if (typeIs(data[key], "table")) {
            $print(`Cleaning sub-table with key "${key as string}"`);
            repairUserData(data[key], reference[key] as object);
        }
    }
}

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
    });

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
    const serverData = await getData(player);
    if (serverData) repairUserData(serverData, defaultData());
    
    const data = serverData ?? defaultData();
    $print(data);
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