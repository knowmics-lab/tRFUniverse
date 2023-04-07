import DataTable, { Alignment, MakeQueryRequestType } from "@/components/DataTable";
import { FragmentBase } from "@/types";
import { apiUrl } from "@/utils";
import Link from "next/link";
import { QueryRequest } from "@/types/requests";

export type FragmentDataTableProps<Q extends QueryRequest> = {
    endpoint: string;
    makeQueryRequest?: MakeQueryRequestType<Q>;
    method?: "GET" | "POST";
};

export default function FragmentDataTable<Q extends QueryRequest>({
    endpoint,
    makeQueryRequest,
    method = "GET",
}: FragmentDataTableProps<Q>) {
    return (
        <DataTable<FragmentBase>
            url={`${apiUrl(endpoint)}`}
            makeQueryRequest={makeQueryRequest}
            idField="id"
            method={method}
            columns={[
                {
                    accessorKey: "id",
                    header: "#",
                    footer: "#",
                    enableSorting: false,
                    enableColumnFilter: false,
                },
                {
                    accessorKey: "name",
                    header: "Name",
                    footer: "Name",
                },
                {
                    accessorKey: "width",
                    header: "Length",
                    footer: "Length",
                },
                {
                    accessorKey: "type",
                    header: "Type",
                    footer: "Type",
                    cell: (info) => (info.getValue() === "NA" ? <>&mdash;</> : info.getValue()),
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
                                <Link href={`/fragments/${row.id}`}>
                                    <a className="btn btn-link btn-sm p-0 m-0">Details</a>
                                </Link>
                            </div>
                        );
                    },
                },
            ]}
            columnsVisibility={{
                type: "md",
                width: "lg",
            }}
            columnsSizing={{
                id: "10%",
                width: "15%",
                type: "20%",
            }}
            columnsAlignment={{
                id: Alignment.CENTER,
                width: Alignment.CENTER,
                type: Alignment.CENTER,
            }}
        />
    );
}
