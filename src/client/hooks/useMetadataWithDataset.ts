import { useMemo, useState } from "react";
import { Metadata, Option } from "@/types";
import { useMetadataAndDatasets } from "@/hooks/useMetadataAndDatasets";

export function useFilteredMetadata(dataset: string, metadataByDataset: Metadata[]) {
    const subtypes = useMemo(
        () =>
            metadataByDataset
                .filter((m) => m.capabilities.subtype)
                .flatMap((m) => Object.entries(m.values_by_dataset[dataset]))
                .map(([value, label]) => ({ value, label } as Option)),
        [dataset, metadataByDataset],
    );
    const sampleTypes = useMemo(
        () =>
            metadataByDataset
                .filter((m) => m.capabilities.sample_type)
                .flatMap((m) => Object.entries(m.values_by_dataset[dataset]))
                .map(([value, label]) => ({ value, label } as Option)),
        [dataset, metadataByDataset],
    );
    const covariatesMetadata = useMemo(
        () =>
            metadataByDataset
                .filter((m) => m.capabilities.covariate)
                .map((m) => {
                    if (m.name === "discretized_ages") {
                        return { ...m, display_name: "Age (Discretized)" };
                    }
                    return m;
                }),
        [metadataByDataset],
    );
    return { subtypes, sampleTypes, covariatesMetadata };
}

export function useMetadataWithDataset(datasetFilter: string | false = false) {
    const [dataset, setDataset] = useState("");
    const { metadata, allDatasets } = useMetadataAndDatasets(datasetFilter);
    const metadataByDataset = useMemo(
        () =>
            metadata.filter(
                (m) =>
                    typeof m.values_by_dataset[dataset] !== "undefined" &&
                    Object.keys(m.values_by_dataset[dataset]).length > 1,
            ),
        [dataset, metadata],
    );
    const filteredMetadata = useFilteredMetadata(dataset, metadataByDataset);
    return { dataset, setDataset, allDatasets, metadataByDataset, ...filteredMetadata };
}
