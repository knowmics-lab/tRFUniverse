const tracks = [
    {
        type: "FeatureTrack",
        trackId: "trna-derived_small_ncrnas-1665415720166-sessionTrack",
        name: "tRNA-derived Small ncRNAs",
        assemblyNames: ["hg19"],
        adapter: {
            type: "Gff3TabixAdapter",
            gffGzLocation: {
                locationType: "UriLocation",
                uri: "/assets/gtf/Human_tRF_hg19.gff3.gz",
            },
            index: {
                location: {
                    locationType: "UriLocation",
                    uri: "/assets/gtf/Human_tRF_hg19.gff3.gz.tbi",
                },
            },
        },
        displays: [
            {
                type: "LinearBasicDisplay",
                displayId: "trna-derived_small_ncrnas-1665415720166-sessionTrack-LinearBasicDisplay",
            },
        ],
        textSearching: {
            textSearchAdapter: {
                type: "TrixTextSearchAdapter",
                textSearchAdapterId: "Human_tRF_hg19.gff3.gz",
                ixFilePath: {
                    uri: "/assets/gtf/trix/Human_tRF_hg19.gff3.gz.ix",
                    locationType: "UriLocation",
                },
                ixxFilePath: {
                    uri: "/assets/gtf/trix/Human_tRF_hg19.gff3.gz.ixx",
                    locationType: "UriLocation",
                },
                metaFilePath: {
                    uri: "/assets/gtf/trix/Human_tRF_hg19.gff3.gz_meta.json",
                    locationType: "UriLocation",
                },
                assemblyNames: ["hg19"],
            },
        },
    },
    {
        type: "FeatureTrack",
        trackId: "human_trnas_hg19.bed.gz-1665478137536-sessionTrack",
        name: "Human tRNAs (hg19)",
        assemblyNames: ["hg19"],
        adapter: {
            type: "BedTabixAdapter",
            bedGzLocation: {
                locationType: "UriLocation",
                uri: "/assets/gtf/Human_tRNAs_hg19.bed.gz",
            },
            index: {
                location: {
                    locationType: "UriLocation",
                    uri: "/assets/gtf/Human_tRNAs_hg19.bed.gz.tbi",
                },
            },
        },
        displays: [
            {
                type: "LinearBasicDisplay",
                displayId: "human_trnas_hg19.bed.gz-1665478137536-sessionTrack-LinearBasicDisplay",
            },
        ],
    },
];

export default tracks;
