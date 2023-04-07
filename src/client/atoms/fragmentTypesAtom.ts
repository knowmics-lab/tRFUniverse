import { apiUrl, remoteApiAtom } from "@/utils";
import { FragmentType } from "@/types";

export const fragmentTypesAtom = remoteApiAtom<FragmentType[]>(apiUrl("fragment-types"));
