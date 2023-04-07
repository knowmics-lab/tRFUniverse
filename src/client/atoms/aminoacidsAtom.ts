import { apiUrl, remoteApiAtom } from "@/utils";
import { Aminoacid } from "@/types";

export const aminoacidsAtom = remoteApiAtom<Aminoacid[]>(apiUrl("aminoacids"));
