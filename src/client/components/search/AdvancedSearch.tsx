import AdvancedSearchForm from "@/components/search/AdvancedSearchForm";
import Loading from "@/components/Loading";
import { Suspense, useState } from "react";
import { Card } from "react-bootstrap";
import { AdvancedSearchRequest, QueryRequest } from "@/types/requests";
import AdvancedSearchResults from "@/components/search/AdvancedSearchResults";
import { useFirstMountState } from "react-use";

type StateType = Omit<AdvancedSearchRequest, keyof QueryRequest>;

export default function AdvancedSearch() {
    const [state, setState] = useState<StateType>();
    const first = useFirstMountState();

    return (
        <>
            <Suspense
                fallback={
                    <Card className="p-3 border-radius-xl bg-white mt-md-8 p-6">
                        <Loading />
                    </Card>
                }
            >
                {first && (
                    <Card className="p-3 border-radius-xl bg-white mt-md-8 p-6">
                        <Loading />
                    </Card>
                )}
                {!first && (
                    <>
                        <AdvancedSearchForm onSubmit={setState} />
                        {!!state && Object.values(state).some((v) => !!v) && (
                            <AdvancedSearchResults searchState={state} />
                        )}
                    </>
                )}
            </Suspense>
        </>
    );
}
