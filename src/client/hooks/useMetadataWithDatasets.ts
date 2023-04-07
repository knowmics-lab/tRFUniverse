import { useMemo, useState } from "react";
import { Option, ValuesMap } from "@/types";
import { filterByKeys } from "@/utils";
import { useMetadataAndDatasets } from "@/hooks/useMetadataAndDatasets";

export function useMetadataWithDatasets(keepDataset = false, datasetFilter: string | false = false) {
    const [datasets, setDatasets] = useState<string[]>([]);
    const { metadata, allDatasets } = useMetadataAndDatasets(datasetFilter);
    const metadataByDataset = useMemo(
        () =>
            metadata
                .map((m) => {
                    return {
                        ...m,
                        values_by_dataset: filterByKeys(m.values_by_dataset, (k) => datasets.includes(k)),
                    };
                })
                .filter((m) => {
                    const v = Object.values(m.values_by_dataset);
                    return (
                        (keepDataset && m.name === "dataset") ||
                        (v.length > 0 && v.some((v) => Object.keys(v).length > 1))
                    );
                }),
        [datasets, keepDataset, metadata],
    );
    const subtypes = useMemo(() => {
        const valuesMap = metadataByDataset
            .filter((m) => m.capabilities.subtype)
            .flatMap((m) => Object.entries(m.values_by_dataset) as [string, ValuesMap][])
            .flatMap(([, values]) => Object.entries(values))
            .reduce((map, [value, label]) => {
                map.set(value, label);
                return map;
            }, new Map<string, string>());
        const result = [] as Option[];
        valuesMap.forEach((label, value) => result.push({ value, label }));
        return result;
    }, [metadataByDataset]);
    const sampleTypes = useMemo(() => {
        const valuesMap = metadataByDataset
            .filter((m) => m.capabilities.sample_type)
            .flatMap((m) => Object.entries(m.values_by_dataset) as [string, ValuesMap][])
            .flatMap(([, values]) => Object.entries(values))
            .reduce((map, [value, label]) => {
                map.set(value, label);
                return map;
            }, new Map<string, string>());
        const result = [] as Option[];
        valuesMap.forEach((label, value) => result.push({ value, label }));
        return result;
    }, [metadataByDataset]);
    const covariatesMetadata = useMemo(
        () =>
            metadataByDataset
                .filter((m) => m.name !== "dataset" && m.capabilities.covariate)
                .map((m) => {
                    if (m.name === "discretized_ages") {
                        return { ...m, display_name: "Age (Discretized)" };
                    }
                    return m;
                }),
        [metadataByDataset],
    );
    return { datasets, setDatasets, allDatasets, metadataByDataset, subtypes, sampleTypes, covariatesMetadata };
}
