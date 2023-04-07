import { Card } from "react-bootstrap";
import { TargetBase } from "@/types";
import DataTable, { Alignment } from "@/components/DataTable";
import { apiUrl } from "@/utils";
import Link from "next/link";
import { formatNumber } from "@/formatters";

type TargetsTabProps = {
    fragmentId: number;
};

export default function TargetsTab({ fragmentId }: TargetsTabProps) {
    return (
        <>
            <Card className="mx-4 mt-4 p-3 shadow-lg border-radius-xl bg-white h-100">
                <DataTable<TargetBase>
                    url={`${apiUrl(`fragments/${fragmentId}/targets`)}`}
                    idField="id"
                    columns={[
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
                            cell: (info) => formatNumber(info.getValue() as number),
                        },
                        {
                            accessorKey: "mfe",
                            header: "MFE",
                            footer: "MFE",
                            enableColumnFilter: false,
                            cell: (info) => formatNumber(info.getValue() as number),
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
                        binding_sites_count: "md",
                        mfe: "lg",
                    }}
                    columnsSizing={{
                        binding_sites_count: "10%",
                        mfe: "10%",
                    }}
                    columnsAlignment={{
                        binding_sites_count: Alignment.CENTER,
                        mfe: Alignment.CENTER,
                    }}
                />
            </Card>
        </>
    );
}
