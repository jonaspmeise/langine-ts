import { Action } from "./Types/Action";
import { Player } from "./Types/Player";

export interface ECS {
    registerAction: (action: Action) => void;

    getActions: (player: Player) => Action[];
    getAllActions: () => Map<Player, Action[]>;
};