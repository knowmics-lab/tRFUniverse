import { DEFAULT_MAKE_QUERY_REQUEST, MakeQueryRequestType } from "@/components/DataTable";
import { AdvancedSearchRequest, QueryRequest } from "@/types/requests";
import { Card } from "react-bootstrap";
import { useMemo } from "react";
import FragmentDataTable from "@/components/FragmentDataTable";

type StateType = Omit<AdvancedSearchRequest, keyof QueryRequest>;

const buildQueryRequestCallback: (state: StateType) => MakeQueryRequestType<AdvancedSearchRequest> =
    (state) => (page, per_page, sort, filters) => ({
        ...DEFAULT_MAKE_QUERY_REQUEST(page, per_page, sort, filters),
        ...state,
    });

type AdvancedSearchResultsProps = {
    searchState: StateType;
};

export default function AdvancedSearchResults({ searchState }: AdvancedSearchResultsProps) {
    const queryRequestCallback = useMemo(() => buildQueryRequestCallback(searchState), [searchState]);

    return (
        <Card className="p-3 border-radius-xl bg-white mt-4">
            <Card.Header className="pb-0 p-3">
                <div className="d-flex justify-content-between">
                    <h6 className="mb-2">Search Results</h6>
                </div>
            </Card.Header>
            <FragmentDataTable endpoint="fragments/search" makeQueryRequest={queryRequestCallback} method="POST" />
        </Card>
    );
}
