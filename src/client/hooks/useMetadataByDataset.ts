import { useMemo } from "react";
import { Metadata } from "@/types";

export function useMetadataByDataset(
    metadataByDataset: Metadata[],
    capability: keyof Metadata["capabilities"],
    distinguishSurvivalFromStatus = false,
) {
    const survivalMetadata = useMemo(
        () =>
            distinguishSurvivalFromStatus
                ? metadataByDataset.filter((m) => m.capabilities.survival).map((m) => m.name)
                : [],
        [distinguishSurvivalFromStatus, metadataByDataset],
    );
    return useMemo(() => {
        const meta = distinguishSurvivalFromStatus
            ? metadataByDataset.map((m) => {
                  const startsWithSurvival = survivalMetadata.some((s) => m.name.startsWith(s));
                  if (startsWithSurvival && !m.capabilities.survival) {
                      return { ...m, display_name: `${m.display_name.replace("status", "").trim()} (Status)` };
                  }
                  return m;
              })
            : metadataByDataset;
        return meta.filter((m) => m.capabilities[capability]);
    }, [capability, distinguishSurvivalFromStatus, metadataByDataset, survivalMetadata]);
}
