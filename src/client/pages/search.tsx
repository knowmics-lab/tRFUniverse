import type { NextPage } from "next";
import Head from "next/head";
import { Container } from "react-bootstrap";
import MainHeader from "@/components/layouts/mainLayout/MainHeader";
import MainFooter from "@/components/layouts/mainLayout/MainFooter";
import { defaultBreadcrumb, defaultTitle } from "@/utils";
import { useRouter } from "next/router";
import QueryResult from "@/components/search/QueryResults";
import AdvancedSearch from "@/components/search/AdvancedSearch";
import { usePreviousDistinct } from "react-use";

function useQuery() {
    const router = useRouter();
    let query = router.query["query"] ?? undefined;
    if (Array.isArray(query)) {
        query = query[0];
    }
    const previousQuery = usePreviousDistinct(query);
    if (query?.localeCompare(previousQuery ?? "") === 0) {
        return previousQuery;
    }
    return query;
}

const Search: NextPage = () => {
    const query = useQuery();
    return (
        <Container fluid className="py-4">
            <Head>
                <title>{defaultTitle("Search")}</title>
            </Head>
            <MainHeader pageTitle="Search" breadcrumbs={defaultBreadcrumb("Search")} />
            {!!query && <QueryResult query={query} />}
            {!query && <AdvancedSearch />}
            <MainFooter />
        </Container>
    );
};

export default Search;
