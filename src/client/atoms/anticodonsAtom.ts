import { apiUrl, remoteApiAtom } from "@/utils";
import { Anticodon } from "@/types";

export const anticodonsAtom = remoteApiAtom<Anticodon[]>(apiUrl("anticodons"));
