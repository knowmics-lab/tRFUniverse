import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import React, { useId, useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { useToggle } from "@/hooks/commons";
import clsx from "clsx";
import { apiUrl } from "@/utils";
import { PaginatedDataListResponse } from "@/types";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { Option } from "react-bootstrap-typeahead/types/types";
import { useRouter } from "next/router";
import classes from "./SearchForm.module.css";

type SearchResult = {
    id: number;
    name: string;
    width: number;
    type: string;
};
type SearchResponse = PaginatedDataListResponse<SearchResult>;

type SearchFormProps = {
    className?: string;
};

export default function SearchForm({
    className = "ms-md-auto pe-md-3 d-none d-md-flex align-items-center",
}: SearchFormProps) {
    const typeaheadId = useId();
    const router = useRouter();
    const [focus, toggleFocus] = useToggle(false);
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState<Option[]>([]);

    const handleSearch = (query: string) => {
        setIsLoading(true);

        fetch(apiUrl("fragments/search/name?per_page=10"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ query }),
        })
            .then((resp) => resp.json())
            .then(({ data }: SearchResponse) => {
                setOptions(data);
                setIsLoading(false);
            });
    };

    return (
        <div className={className}>
            <Form className="d-flex align-items-center">
                <InputGroup className={clsx({ focused: focus })}>
                    <InputGroup.Text className="text-body">
                        <FontAwesomeIcon icon={faSearch} aria-hidden />
                    </InputGroup.Text>
                    <AsyncTypeahead
                        className={classes.typeahead}
                        filterBy={() => true}
                        id={typeaheadId}
                        isLoading={isLoading}
                        labelKey="name"
                        minLength={3}
                        onSearch={handleSearch}
                        options={options}
                        placeholder="Search for fragment..."
                        onFocus={() => toggleFocus()}
                        onBlur={() => toggleFocus()}
                        onChange={(selected) => {
                            if (selected.length == 1) {
                                const { id } = selected[0] as SearchResult;
                                router.push(`/fragments/${id}`);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                router.push({
                                    pathname: "/search",
                                    query: { query: e.currentTarget.value },
                                });
                            }
                        }}
                        renderMenuItemChildren={(result) => {
                            const { name, type } = result as SearchResult;
                            return (
                                <div className="d-flex flex-column justify-content-center">
                                    <h6 className="text-sm font-weight-normal mb-1">
                                        <span className="font-weight-bold">{name}</span>
                                    </h6>
                                    <p className="text-xs text-secondary mb-0">{type === "NA" ? "Unknown" : type}</p>
                                </div>
                            );
                        }}
                    />
                </InputGroup>
            </Form>
        </div>
    );
}
