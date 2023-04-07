import { Card, Table } from "react-bootstrap";
import { ALIAS_SOURCES, ALIAS_SOURCES_URLS } from "@/constants";
import { useMemo } from "react";

type TargetsTabProps = {
    synonyms: string[];
};

export default function AliasesTab({ synonyms }: TargetsTabProps) {
    const parsedSynonyms = useMemo(
        () =>
            synonyms
                .map((synonym) => {
                    const [db, alias] = synonym.split("::");
                    const source = ALIAS_SOURCES[db];
                    if (!source) return null;
                    const url = ALIAS_SOURCES_URLS[db];
                    return {
                        id: synonym,
                        source: ALIAS_SOURCES[db],
                        alias,
                        url,
                    };
                })
                .filter((s) => s !== null),
        [synonyms],
    );
    return (
        <>
            <Card className="mx-4 mt-4 p-3 shadow-lg border-radius-xl bg-white h-100">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th className="text-center w-10">#</th>
                            <th>Alias</th>
                            <th className="w-10">Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parsedSynonyms.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center">
                                    This fragment does not have aliases!
                                </td>
                            </tr>
                        )}
                        {parsedSynonyms.map((data, index) => (
                            <tr key={`alias-${data?.id}`}>
                                <td className="text-center">{index + 1}</td>
                                <td>{data?.alias}</td>
                                <td>
                                    <a href={data?.url} target="_blank" rel="noreferrer">
                                        {data?.source}
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </>
    );
}
