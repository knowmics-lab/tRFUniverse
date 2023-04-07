import { DEFAULT_MAKE_QUERY_REQUEST, MakeQueryRequestType } from "@/components/DataTable";
import { SearchQueryRequest } from "@/types/requests";
import { Card } from "react-bootstrap";
import { useMemo } from "react";
import FragmentDataTable from "@/components/FragmentDataTable";

const buildQueryRequestCallback: (query: string) => MakeQueryRequestType<SearchQueryRequest> =
    (query) => (page, per_page, sort, filters) => ({
        ...DEFAULT_MAKE_QUERY_REQUEST(page, per_page, sort, filters),
        query,
    });

type QueryResultsProps = {
    query: string;
};

export default function QueryResult({ query }: QueryResultsProps) {
    const queryRequestCallback = useMemo(() => buildQueryRequestCallback(query), [query]);

    return (
        <Card className="p-3 border-radius-xl bg-white mt-md-7">
            <FragmentDataTable endpoint="fragments/search/name" makeQueryRequest={queryRequestCallback} method="POST" />
        </Card>
    );
}
