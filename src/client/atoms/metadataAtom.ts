import { apiUrl, remoteApiAtom } from "@/utils";
import { Metadata } from "@/types";

export const metadataAtom = remoteApiAtom<Metadata[]>(apiUrl("metadata"));
