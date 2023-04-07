import type { NextPage } from "next";
import Head from "next/head";
import { Card, Container } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { defaultBreadcrumb, defaultTitle } from "@/utils";
import { URLs } from "@/constants";

const ALL_DOWNLOADS = [
    {
        title: "tRF annotations",
        description: `A TSV file containing all tRF annotations. For each tRF, the file contains its identifier, the 
        genomic position (chromosome, start, end, strand, and width), the type of fragment, the aminoacid and anticodon 
        of the tRNA it is derived from, and all its synonyms.`,
        link: URLs.TRF_ANNOTATION,
    },
    {
        title: "tRF expressions by dataset",
        description: `A zip archive containing expression data and metadata for all tRF divided by dataset in RDS 
        format. For each dataset, the archive contains three RDS (R Data Serialization) files: one containing the
        raw counts data, one containing the log2(RPM+1) expression data, and one containing the metadata.`,
        link: URLs.EXPRESSION_BY_DATASET,
    },
    {
        title: "tRF target interactions",
        description: `A CSV file containing all tRF target interaction at the gene level. For each interaction, the 
        file contains the tRF identifier, the target gene (ENSEMBL gene identifier), the gene name, the RNAhybrid minimum 
        free energy, the number of binding sites, and an unique identifiers for the tRF-target pair.`,
        link: URLs.GENE_TARGETS,
    },
    {
        title: "tRF target binding sites",
        description: `A CSV file containing for each tRF-target interaction its binding sites. For each binding site,
        the file contains, the tRF-target pair identifier, the transcript identifier (ENSEMBL transcript identifier),
        the transcript name, the position inside the target (UTR3, UTR5, CDS), the start and end position in the 
        target sequence, the RNAhybrid minimum free energy, the count of evidences supporting the binding site, and
        an unique binding site identifier.`,
        link: URLs.BINDING_SITES,
    },
    {
        title: "tRF target binding sites evidences",
        description: `A CSV file containing for each tRF-target binding site its evidences in the targeting datasets. 
        For each evidence, the file contains the algorithm used to identify the binding site, the tRF sequence, the
        target sequence, the RNAhybrid minimum free energy, the sample identifier, and the binding site identifier.`,
        link: URLs.BINDING_SITE_SOURCES,
    },
    {
        title: "Targeting datasets metadata",
        description: `A CSV file describing the datasets used to identify tRF-target interactions. For each dataset,
        the file reports the dataset identifier (NCBI BioProject accession), the sample identifier (NCBI SRA Run accession),
        the sample type (CLASH, CLEAR-CLIP, CLIP-Seq), the cell line, the ago antibody used for immunoprecipitation, and
        an internal unique identifier used to link the dataset to the evidence file.`,
        link: URLs.TARGETING_DATASETS_METADATA,
    },
    {
        title: "tRF target expressions by dataset",
        description: `A CSV file containing the expression of all tRF-target interactions in each dataset.`,
        link: URLs.TARGETS_LFCS_MATRIX,
    },
    {
        title: "NCI60 cell lines metadata",
        description: "A CSV file containing all metadata for the NCI60 cell lines.",
        link: URLs.NCI60_METADATA,
    },
    {
        title: "Biological Fluids metadata",
        description: "A CSV file containing all metadata for the biological fluid samples.",
        link: URLs.FLUIDS_METADATA,
    },
    {
        title: "TCGA/TARGET metadata",
        description: "A CSV file containing all metadata for the TCGA/TARGET samples.",
        link: URLs.TCGA_TARGET_METADATA,
    },
];

const Downloads: NextPage = () => {
    return (
        <Container fluid className="py-4">
            <Head>
                <title>{defaultTitle("Downloads")}</title>
            </Head>
            <MainHeader pageTitle="Downloads" breadcrumbs={defaultBreadcrumb("Downloads")} />
            <Card className="mt-md-7 p-3 border-radius-xl bg-white">
                <Card.Body>
                    <Card.Text className="text-justify">
                        Please remember that all data produced by the tRFUniverse team are provided under the{" "}
                        <a
                            href="https://creativecommons.org/licenses/by-sa/4.0/legalcode"
                            target="_blank"
                            rel="noreferrer"
                        >
                            CreativeCommons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) license
                        </a>
                        . By downloading and using our data, you implicitly agree to the terms of this license.
                    </Card.Text>
                    <Card.Text className="text-justify">
                        The tRFUniverse team is not responsible for the content of any external sources used to build
                        the database, nor does it claim ownership of those sources. Therefore, any use of data from
                        external sources is intended to be under the license terms established by the respective owners.
                    </Card.Text>
                    <Card.Text className="text-justify">
                        If you use any of the data or results provided by tRFUniverse, please cite the following papers:
                    </Card.Text>
                    <ul>
                        <li>TODO;</li>
                        <li>TODO.</li>
                    </ul>
                </Card.Body>
            </Card>
            <Card className="my-4 p-3 border-radius-xl bg-white">
                <Card.Header className="pb-0 p-3">
                    <h6 className="mb-0">Downloads</h6>
                </Card.Header>
                <Card.Body className="pt-4 p-3">
                    <ul className="list-group">
                        {ALL_DOWNLOADS.map((download, index) => (
                            <li
                                className="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg"
                                key={`download-${index}`}
                            >
                                <div className="d-flex flex-column">
                                    <h6 className="mb-3 text-sm">
                                        <a href={download.link} rel="noreferrer" target="_blank">
                                            {download.title}
                                        </a>
                                    </h6>
                                    <span className="text-xs text-justify">{download.description}</span>
                                </div>
                                <div className="ms-auto text-end">
                                    <a
                                        className="btn btn-link text-primary text-gradient px-3 mb-0"
                                        href={download.link}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        <i className="fas fa-download me-2" aria-hidden="true"></i>Download
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card.Body>
            </Card>
            <MainFooter />
        </Container>
    );
};

export default Downloads;
