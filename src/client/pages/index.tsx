/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import Head from "next/head";
import { Card, Col, Container, Row } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { defaultBreadcrumb, defaultTitle } from "@/utils";
import Image from "next/image";
import React from "react";

const Home: NextPage = () => {
    return (
        <Container fluid className="py-4">
            <Head>
                <title>{defaultTitle("Homepage")}</title>
            </Head>
            <MainHeader pageTitle="Welcome" breadcrumbs={defaultBreadcrumb("Home")} />
            <Row className="justify-content-center">
                <Col lg={7} className="text-center mx-auto">
                    <h1 className="text-white mb-2 mt-5">Welcome to tRFUniverse!</h1>
                </Col>
            </Row>
            <Card className="p-3 border-radius-xl bg-white">
                <Card.Body>
                    <Row>
                        <Col className="text-justify">
                            tRFUniverse is a novel comprehensive web app for the interactive analysis of tRNA-derived
                            ncRNAs in human cancer. tRFUniverse presents the most extensive collection of different
                            classes of tRNA-derived ncRNAs analyzed across all the TCGA tumor cohorts (~11,000 samples),
                            NCI-60 cell lines, several different human biological fluids (~293 samples), and across all
                            the pediatric tumor cohorts available on TARGET (~2,000 samples). Moreover, several AGO
                            CLASH/CLEAR/CLIP-Seq data (82 samples) were analyzed to identify the molecular interactions
                            between tRNA-derived ncRNAs and other transcripts.
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-center my-3">
                            <Image
                                src="/assets/img/website_content.png"
                                alt="The content of tRFUniverse"
                                layout="responsive"
                                priority
                                width={1920}
                                height={1080}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-justify">
                            tRFUniverse combines in a single resource a set of analytical features that may be helpful
                            to researchers in investigating the involvement of these small RNA molecules in cancer
                            biology. Relevant examples include (i) target enrichment analyses; (ii) phenotype simulation
                            analysis; (iii) correlation analyses; (iv) metadata-mediated correlation analyses; (v)
                            correlated genes enrichment analyses; (vi) survival analysis; (vii) literature
                            knowledge-graph analyses; (viii) dimensionality reduction analyses; (ix) cluster analyses;
                            (x) differential expression analyses; and (xi) differential survival analyses.
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-center position-relative">
                            <Image
                                src="/assets/img/website_analysis.png"
                                alt="The analysis included in tRFUniverse"
                                layout="responsive"
                                priority
                                width={1920}
                                height={1080}
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            <Card className="my-4 p-3 border-radius-xl bg-gradient-faded-light-vertical shadow-lg">
                <Card.Body className="p-3">
                    <Row style={{ height: "4em" }}>
                        <Col md={6} className="text-center position-relative">
                            <Image
                                src="/assets/university/medclin.png"
                                alt="MedClin @ University of Catania"
                                layout="fill"
                                objectFit="contain"
                                className="border-radius-lg shadow"
                                priority
                            />
                        </Col>
                        <Col md={6} className="text-center position-relative">
                            <Image
                                src="/assets/university/osu.png"
                                alt="Ohio State University"
                                layout="fill"
                                objectFit="contain"
                                className="border-radius-lg shadow"
                                priority
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            <MainFooter />
        </Container>
    );
};

export default Home;
