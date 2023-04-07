const assembly = {
    name: "hg19",
    aliases: ["GRCh37"],
    sequence: {
        type: "ReferenceSequenceTrack",
        trackId: "refseq_track",
        adapter: {
            type: "BgzipFastaAdapter",
            fastaLocation: {
                uri: "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz",
                locationType: "UriLocation",
            },
            faiLocation: {
                uri: "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.fai",
                locationType: "UriLocation",
            },
            gziLocation: {
                uri: "https://jbrowse.org/genomes/hg19/fasta/hg19.fa.gz.gzi",
                locationType: "UriLocation",
            },
        },
        rendering: {
            type: "DivSequenceRenderer",
        },
    },
    refNameAliases: {
        adapter: {
            type: "RefNameAliasAdapter",
            location: {
                uri: "https://s3.amazonaws.com/jbrowse.org/genomes/hg19/hg19_aliases.txt",
                locationType: "UriLocation",
            },
        },
    },
};

export default assembly;
