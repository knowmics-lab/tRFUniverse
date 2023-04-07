import { PathwayListTableRow, PHENSIMCompletedResult } from "@/types";
import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import ArrayDataTable, { DefaultNumberFilter } from "@/components/ArrayDataTable";
import { Alignment } from "@/components/DataTable";
import { formatNumber, formatP } from "@/formatters";

type Props = {
    results: PHENSIMCompletedResult;
    onSelectPathway: (pathwayId: string) => void;
};

export default function PathwayListTable({ results, onSelectPathway }: Props) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PathwayListTableRow[]>([]);

    useEffect(() => {
        setLoading(true);
        fetch(results.results.pathway_list)
            .then((res) => res.json())
            .then((data) => {
                setData(data.data as PathwayListTableRow[]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [results.results.pathway_list]);

    return (
        <>
            {loading && <Loading message="Loading..." />}
            {data && (
                <ArrayDataTable<PathwayListTableRow>
                    data={data}
                    columns={[
                        {
                            accessorKey: "pathwayId",
                            header: "Id",
                            footer: "Id",
                        },
                        {
                            accessorKey: "pathwayName",
                            header: "Pathway",
                            footer: "Pathway",
                        },
                        {
                            accessorKey: "pathwayActivityScore",
                            header: "Activity Score",
                            footer: "Activity Score",
                            cell: ({ row }) => formatNumber(row.original.pathwayActivityScore),
                            filterFn: DefaultNumberFilter,
                        },
                        {
                            accessorKey: "pathwayPValue",
                            header: "p",
                            footer: "p",
                            cell: ({ row }) => formatP(row.original.pathwayPValue),
                            filterFn: DefaultNumberFilter,
                        },
                        {
                            accessorKey: "pathwayFDR",
                            header: "FDR",
                            footer: "FDR",
                            cell: ({ row }) => formatP(row.original.pathwayFDR),
                            filterFn: DefaultNumberFilter,
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
                                        <a
                                            href="#"
                                            className="btn btn-link btn-sm p-0 m-0"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onSelectPathway(row.original.pathwayId);
                                            }}
                                        >
                                            Details
                                        </a>
                                    </div>
                                );
                            },
                        },
                    ]}
                    columnsVisibility={{
                        pathwayId: "xl",
                        pathwayFDR: "xl",
                    }}
                    columnsSizing={{}}
                    columnsAlignment={{
                        pathwayActivityScore: Alignment.CENTER,
                        pathwayPValue: Alignment.CENTER,
                        pathwayFDR: Alignment.CENTER,
                    }}
                    wrapColumns={{
                        pathwayName: true,
                    }}
                />
            )}
        </>
    );
}
