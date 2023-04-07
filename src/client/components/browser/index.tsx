import "@fontsource/roboto";
import { createViewState, JBrowseLinearGenomeView } from "@jbrowse/react-linear-genome-view";
import assembly from "./assembly";
import tracks from "./tracks";
import { useMemo, useState } from "react";
import { FragmentPosition } from "@/types";
import { useEffectOnce } from "react-use";

const POSITION_RANGE = 5;

const defaultSession = {
    name: "tRFUniverse2 session",
    view: {
        id: "linearGenomeView",
        type: "LinearGenomeView",
        trackLabels: "offset",
        tracks: [
            {
                id: "s6p0nXbi1",
                type: "ReferenceSequenceTrack",
                configuration: "refseq_track",
                displays: [
                    {
                        id: "sbKrB4DsDZ",
                        type: "LinearReferenceSequenceDisplay",
                        height: 50,
                        configuration: "refseq_track-LinearReferenceSequenceDisplay",
                        showForward: true,
                        showReverse: true,
                        showTranslation: false,
                    },
                ],
            },
            {
                id: "eWXXvS7kf",
                type: "FeatureTrack",
                configuration: "human_trnas_hg19.bed.gz-1665478137536-sessionTrack",
                displays: [
                    {
                        id: "MJDNBx7T31",
                        type: "LinearBasicDisplay",
                        height: 40,
                        configuration: "human_trnas_hg19.bed.gz-1665478137536-sessionTrack-LinearBasicDisplay",
                    },
                ],
            },
            {
                id: "AmD9gMp4K",
                type: "FeatureTrack",
                configuration: "trna-derived_small_ncrnas-1665415720166-sessionTrack",
                displays: [
                    {
                        id: "03baaO9lC4",
                        type: "LinearBasicDisplay",
                        trackDisplayMode: "compact",
                        height: 200,
                        configuration: "trna-derived_small_ncrnas-1665415720166-sessionTrack-LinearBasicDisplay",
                    },
                ],
            },
        ],
    },
};

type ViewModel = ReturnType<typeof createViewState>;

type BrowserProps = {
    position?: string | FragmentPosition | undefined;
};

const usePosition = (position: BrowserProps["position"]) => {
    return useMemo(() => {
        if (typeof position === "string") return position;
        if (!position) return undefined;
        return `${position.chromosome.replace(/^chr/, "")}:${position.start - POSITION_RANGE}-${
            position.end - POSITION_RANGE
        }`;
    }, [position]);
};

export default function Browser({ position }: BrowserProps) {
    const location = usePosition(position);
    const [viewState, setViewState] = useState<ViewModel>();

    useEffectOnce(() => {
        const state = createViewState({
            assembly,
            tracks,
            location,
            defaultSession,
        });
        setViewState(state);
    });

    if (!viewState) {
        return null;
    }
    return (
        <>
            <JBrowseLinearGenomeView viewState={viewState} />
        </>
    );
}
