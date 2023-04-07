import { useMemo, useRef } from "react";
import { useAtom } from "jotai";
import { metadataAtom } from "@/atoms";
import { filterDatasets } from "@/utils";
import { Option } from "@/types";

export function useMetadataAndDatasets(datasetFilter: string | false = false) {
    const filterRef = useRef(datasetFilter);
    const [metadata] = useAtom(metadataAtom);
    const allDatasets = useMemo(
        () =>
            metadata
                .filter((m) => m.capabilities.dataset)
                .map((m) => (filterRef.current ? filterDatasets(m, filterRef.current) : Object.entries(m.values)))
                .flatMap((m) => m)
                .map(([value, label]) => ({ value, label } as Option)),
        [metadata],
    );
    return { metadata, allDatasets };
}
