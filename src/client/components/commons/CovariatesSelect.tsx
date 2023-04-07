import React, { useId } from "react";
import { Metadata } from "@/types";
import MultiSelect from "@/components/commons/MultiSelect";
import { Form } from "react-bootstrap";

type CovariatesSelectProps = {
    covariatesMetadata: Metadata[];
    dispatch: (action: { type: "covariates"; payload: string[] }) => void;
    selectedCovariates?: string[];
};

export default function CovariatesSelect({ covariatesMetadata, selectedCovariates, dispatch }: CovariatesSelectProps) {
    const selectId = useId();
    return (
        <>
            <Form.Label htmlFor={`react-select-${selectId}-input`}>
                Select covariates for batch correction (optional)
            </Form.Label>
            <MultiSelect<Metadata>
                instanceId={selectId}
                isClearable
                options={covariatesMetadata}
                getOptionLabel={(m) => m.display_name}
                getOptionValue={(m) => m.name}
                value={(selectedCovariates ?? [])
                    .map((c) => covariatesMetadata.find((m) => m.name === c))
                    .filter((m): m is Metadata => typeof m !== "undefined")}
                onChange={(m) => dispatch({ type: "covariates", payload: m.map((m) => m.name) })}
            />
        </>
    );
}
