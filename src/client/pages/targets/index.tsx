import type { NextPage } from "next";
import Head from "next/head";
import { Card, Container } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { apiUrl, defaultBreadcrumb, defaultTitle } from "@/utils";
import DataTable, { Alignment } from "@/components/DataTable";
import { TargetBase } from "@/types";
import Link from "next/link";

const FORMATTER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

const TargetsIndex: NextPage = () => {
    return (
        <Container fluid className="py-4">
            <Head>
                <title>{defaultTitle("Browse Targets")}</title>
            </Head>
            <MainHeader pageTitle="Targets" breadcrumbs={defaultBreadcrumb("Targets")} />
            <Card className="p-3 border-radius-xl bg-white mt-md-7">
                <DataTable<TargetBase>
                    url={`${apiUrl("targets")}`}
                    idField="id"
                    columns={[
                        {
                            accessorKey: "fragment_name",
                            header: "Fragment",
                            footer: "Fragment",
                        },
                        {
                            accessorKey: "gene_id",
                            header: "Target Id",
                            footer: "Target Id",
                        },
                        {
                            accessorKey: "gene_name",
                            header: "Target Name",
                            footer: "Target Name",
                        },
                        {
                            accessorKey: "count",
                            header: "Binding Sites",
                            footer: "Binding Sites",
                            enableColumnFilter: false,
                            cell: (info) => FORMATTER.format(info.getValue() as number),
                        },
                        {
                            accessorKey: "mfe",
                            header: "MFE",
                            footer: "MFE",
                            enableColumnFilter: false,
                            cell: (info) => FORMATTER.format(info.getValue() as number),
                        },
                        {
                            id: "actions",
                            header: undefined,
                            footer: undefined,
                            enableSorting: false,
                            enableColumnFilter: false,
                            cell: ({ row }) => {
                                return (
                                    <div className="btn-group-sm">
                                        <Link href={`/targets/${row.id}`}>
                                            <a className="btn btn-link btn-sm p-0 m-0">Details</a>
                                        </Link>
                                    </div>
                                );
                            },
                        },
                    ]}
                    columnsVisibility={{
                        gene_id: "lg",
                        count: "md",
                        mfe: "lg",
                    }}
                    columnsSizing={{
                        count: "10%",
                        mfe: "10%",
                    }}
                    columnsAlignment={{
                        count: Alignment.CENTER,
                        mfe: Alignment.CENTER,
                    }}
                />
            </Card>
            <MainFooter />
        </Container>
    );
};

export default TargetsIndex;
