import { PathwayTableRow, PHENSIMCompletedResult } from "@/types";
import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import ArrayDataTable, { DefaultNumberFilter } from "@/components/ArrayDataTable";
import { Alignment } from "@/components/DataTable";
import { formatNumber, formatP } from "@/formatters";

type Props = {
    results: PHENSIMCompletedResult;
    pathwayId: string;
};

export default function PathwayTable({ results, pathwayId }: Props) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PathwayTableRow[]>([]);

    useEffect(() => {
        setLoading(true);
        fetch(results.results.pathways[pathwayId])
            .then((res) => res.json())
            .then((data) => {
                setData(data.data as PathwayTableRow[]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [pathwayId, results.results.pathways]);

    return (
        <>
            {loading && <Loading message="Loading..." />}
            {data && (
                <ArrayDataTable<PathwayTableRow>
                    data={data}
                    columns={[
                        {
                            accessorKey: "nodeId",
                            header: "Id",
                            footer: "Id",
                        },
                        {
                            accessorKey: "nodeName",
                            header: "Node",
                            footer: "Node",
                        },
                        {
                            accessorKey: "activityScore",
                            header: "Activity Score",
                            footer: "Activity Score",
                            cell: ({ row }) => formatNumber(row.original.activityScore),
                            filterFn: DefaultNumberFilter,
                        },
                        {
                            accessorKey: "pValue",
                            header: "p",
                            footer: "p",
                            cell: ({ row }) => formatP(row.original.pValue),
                            filterFn: DefaultNumberFilter,
                        },
                        {
                            accessorKey: "FDR",
                            header: "FDR",
                            footer: "FDR",
                            cell: ({ row }) => formatP(row.original.FDR),
                            filterFn: DefaultNumberFilter,
                        },
                    ]}
                    columnsVisibility={{
                        nodeId: "xl",
                        pValue: "xl",
                        FDR: "xl",
                    }}
                    columnsSizing={{}}
                    columnsAlignment={{
                        activityScore: Alignment.CENTER,
                        pValue: Alignment.CENTER,
                        FDR: Alignment.CENTER,
                    }}
                    wrapColumns={{
                        nodeName: true,
                    }}
                />
            )}
        </>
    );
}
