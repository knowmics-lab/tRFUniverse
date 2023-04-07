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
                    <Card.Text className="text-justify">
                        tRFUniverse is a novel comprehensive online getaway for tRNA-derived ncRNA expression
                        interactive analyses in human cancer. tRFUniverse combines in a single resource several of the
                        analyses and features implemented in other pre-existing databases plus additional ones that may
                        be helpful to researchers to investigate the involvement of these small RNA molecules in cancer
                        biology. Moreover, tRFUniverse presents the most extensive collection of different classes of
                        tRNA-derived ncRNAs analyzed across all the TCGA tumor types and NCI-60 cell lines and, for the
                        first time, also across all the pediatric tumor cohorts available on TARGET and several
                        different human biological fluids. Finally, hundreds of AGO CLASH/CLEAR/CLIP-Seq data were
                        analyzed in order to identify the molecular interactions between tRNA-derived ncRNAs and other
                        transcripts and reported in tRFUniverse.
                    </Card.Text>
                    <Card.Text className="text-justify">
                        PLACEHOLDER TO UPDATE
                        <br />
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dapibus enim quis maximus
                        lacinia. Curabitur tempor ac neque in fringilla. Quisque a sodales velit. Cras lobortis sodales
                        lobortis. Donec quis erat dui. Nam vitae libero fringilla, finibus lectus et, finibus nunc. Sed
                        consectetur, lectus vitae sodales lacinia, neque nulla euismod leo, at venenatis sapien tortor
                        vel velit. Etiam faucibus pharetra tellus vitae bibendum. Curabitur mollis erat eget nisl
                        scelerisque ullamcorper. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                        posuere cubilia curae; Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras commodo,
                        lectus ut semper volutpat, velit turpis ornare nulla, sit amet hendrerit ante purus eu sapien.
                        Suspendisse eget justo aliquam, vestibulum magna non, faucibus sapien. Class aptent taciti
                        sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent fringilla
                        consequat volutpat. Donec quis venenatis sem, non aliquam metus. Nunc eu diam egestas, ornare
                        libero vitae, sodales elit. Morbi sit amet consectetur neque, sit amet bibendum ipsum. Praesent
                        ex orci, malesuada quis tincidunt at, mollis a massa. Suspendisse pretium nisl eget magna
                        imperdiet, ut mattis nibh laoreet. Fusce pharetra gravida nisl ac imperdiet. Fusce efficitur
                        velit ac sagittis finibus. In in nisl sed lectus molestie fringilla id sed lacus. Maecenas
                        consectetur, justo eu vulputate cursus, nunc ante pretium justo, in pharetra nunc urna vel enim.
                        Nulla convallis urna sit amet massa congue, eu vehicula augue rutrum.
                        {/*The database reports 143 distinct tRNA-derived ncRNAs, categorized in tRNA-derived fragments (9*/}
                        {/*tRF-5s, 45 tRF-3s), tRNA-derived small RNAs (75 tsRNAs), and tRNA 5’ leader RNAs (14 sequences*/}
                        {/*identified). This latter group represents an additional evidence of tRNA-derived ncRNAs*/}
                        {/*originating from the 5’ leader region of precursor tRNA, a class of tRNA-derived small RNAs*/}
                        {/*currently poorly investigated.*/}
                    </Card.Text>
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
