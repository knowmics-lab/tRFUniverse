import type { NextPage } from "next";
import Head from "next/head";
import { Card, Container } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { defaultBreadcrumb, defaultTitle } from "@/utils";
import classes from "@/styles/license.module.css";

const License: NextPage = () => {
    return (
        <Container fluid className="py-4">
            <Head>
                <title>{defaultTitle("License")}</title>
            </Head>
            <MainHeader pageTitle="License" breadcrumbs={defaultBreadcrumb("License")} />
            <Card className="p-3 border-radius-xl bg-white mt-6">
                <Card.Body>
                    <div className={classes.termsContent}>
                        <h1>End User License Agreement</h1>
                        <hr />
                        <p>
                            This work is licensed under the terms of the CreativeCommons Attribution-ShareAlike 4.0
                            International (CC BY-SA 4.0) license.
                        </p>
                        <h3>Simple Human Explanation</h3>
                        <p>You are free to:</p>
                        <ul>
                            <li>
                                <span className="fw-bold">Share</span> &mdash; copy and redistribute the material in any
                                medium or format
                            </li>
                            <li>
                                <span className="fw-bold">Adapt</span> &mdash; remix, transform, and build upon the
                                material for any purpose, even commercially.
                            </li>
                        </ul>
                        <p>The licensor cannot revoke these freedoms as long as you follow the license terms.</p>
                        <p>Under the following terms:</p>
                        <ul>
                            <li>
                                <span className="fw-bold">Attribution</span> &mdash; You must give appropriate credit,
                                provide a link to the license, and indicate if changes were made. You may do so in any
                                reasonable manner, but not in any way that suggests the licensor endorses you or your
                                use.
                            </li>
                            <li>
                                <span className="fw-bold">ShareAlike</span> &mdash; If you remix, transform, or build
                                upon the material, you must distribute your contributions under the same license as the
                                original.
                            </li>
                            <li>
                                <span className="fw-bold">No additional restrictions</span> &mdash; You may not apply
                                legal terms or technological measures that legally restrict others from doing anything
                                the license permits.
                            </li>
                        </ul>
                        <p>Notices:</p>
                        <ul>
                            <li>
                                You do not have to comply with the license for elements of the material in the public
                                domain or where your use is permitted by an applicable exception or limitation.
                            </li>
                            <li>
                                No warranties are given. The license may not give you all of the permissions necessary
                                for your intended use. For example, other rights such as publicity, privacy, or moral
                                rights may limit how you use the material.
                            </li>
                        </ul>
                        <p>
                            This is a human-readable summary of (and not a substitute for) the{" "}
                            <a
                                href="https://creativecommons.org/licenses/by-sa/4.0/legalcode"
                                target="_blank"
                                rel="noreferrer"
                            >
                                license
                            </a>
                            .
                        </p>
                    </div>
                </Card.Body>
            </Card>
            <MainFooter />
        </Container>
    );
};

export default License;
