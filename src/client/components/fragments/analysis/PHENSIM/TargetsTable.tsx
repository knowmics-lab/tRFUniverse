import { InputTableRow, PHENSIMCompletedResult } from "@/types";
import React, { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import ArrayDataTable from "@/components/ArrayDataTable";

type Props = {
    results: PHENSIMCompletedResult;
};

export default function TargetsTable({ results }: Props) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<InputTableRow[]>([]);

    useEffect(() => {
        setLoading(true);
        fetch(results.input_table_url)
            .then((res) => res.json())
            .then((data) => {
                setData(data as InputTableRow[]);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [results.input_table_url]);

    return (
        <>
            {loading && <Loading message="Loading..." />}
            {data && (
                <ArrayDataTable<InputTableRow>
                    data={data}
                    columns={[
                        {
                            accessorKey: "ensembl_id",
                            header: "Id",
                            footer: "Id",
                        },
                        {
                            accessorKey: "entrez_id",
                            header: "Entrez Id",
                            footer: "Entrez Id",
                        },
                        {
                            accessorKey: "gene_symbol",
                            header: "Symbol",
                            footer: "Symbol",
                        },
                    ]}
                />
            )}
        </>
    );
}
