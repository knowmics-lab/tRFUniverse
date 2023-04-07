import type { NextPage } from "next";
import Head from "next/head";
import { Card, Col, Container, Row } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { defaultBreadcrumb, defaultTitle } from "@/utils";
import React from "react";
import clsx from "clsx";
import Image from "next/image";

const AUTHORS = [
    [
        { name: "Alessandro La Ferlita", affiliation: "The Ohio State University", picture: "laferlita.png" },
        { name: "Giovanni Nigita", affiliation: "The Ohio State University", picture: "nigita.png" },
        { name: "Joal D. Beane", affiliation: "The Ohio State University", picture: "beane.jpeg" },
        { name: "Philip N. Tsichlis", affiliation: "The Ohio State University", picture: "tsichlis.jpg" },
        { name: "Alfredo Pulvirenti", affiliation: "University of Catania", picture: "pulvirenti.png" },
    ],
    [
        { name: "Salvatore Alaimo", affiliation: "University of Catania", picture: "alaimo.png" },
        { name: "Rosario Distefano", affiliation: "The Ohio State University", picture: "distefano.jpg" },
        { name: "Alfredo Ferro", affiliation: "University of Catania", picture: "ferro.jpg" },
        { name: "Carlo M. Croce", affiliation: "The Ohio State University", picture: "croce.jpg" },
    ],
];

const About: NextPage = () => {
    return (
        <Container fluid className="py-4">
            <Head>
                <title>{defaultTitle("About Us")}</title>
            </Head>
            <MainHeader pageTitle="About Us" breadcrumbs={defaultBreadcrumb("About Us")} />
            <Card className="mt-md-7 p-3 border-radius-xl bg-white">
                <Card.Body>
                    <Card.Text className="text-justify">
                        tRFUniverse is under constant maintenance and development. If you have any questions, comments,
                        or suggestions, please open a new issue on our{" "}
                        <a href="https://github.com/alaimos/tRFUniverse" target="_blank" rel="noreferrer">
                            GitHub page
                        </a>
                        .
                    </Card.Text>
                </Card.Body>
            </Card>
            <Card className="my-4 p-3 border-radius-xl bg-white">
                <Card.Header className="pb-0 p-3">
                    <h6 className="mb-0">The tRFUniverse team</h6>
                </Card.Header>
                <Card.Body className="p-3">
                    <Row>
                        {AUTHORS.map((authorGroup, i) => (
                            <Col key={`authors-group-${i}`} xs={12} md={6}>
                                <ul className="list-group">
                                    {authorGroup.map(({ name, affiliation, picture }, j) => (
                                        <li
                                            key={`author-${i}-${j}`}
                                            className={clsx(
                                                "list-group-item border-0 d-flex",
                                                "align-items-center px-0 mb-2",
                                                { "mb-md-0": j === authorGroup.length - 1 },
                                            )}
                                        >
                                            <div className="avatar me-3 position-relative">
                                                <Image
                                                    src={`/assets/about_us/${picture}`}
                                                    alt={name}
                                                    layout="fill"
                                                    objectFit="contain"
                                                    className="border-radius-lg shadow"
                                                />
                                            </div>
                                            <div className="d-flex align-items-start flex-column justify-content-center">
                                                <h6 className="mb-0 text-sm">{name}</h6>
                                                <p className="mb-0 text-xs">{affiliation}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
            <MainFooter />
        </Container>
    );
};

export default About;
