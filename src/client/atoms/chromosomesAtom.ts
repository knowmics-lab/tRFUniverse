import { apiUrl, remoteApiAtom } from "@/utils";
import { Chromosome } from "@/types";

export const chromosomesAtom = remoteApiAtom<Chromosome[]>(apiUrl("chromosomes"));
