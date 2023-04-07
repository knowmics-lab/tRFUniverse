import { Option } from "@/types";
import { SampleFilteringRequest } from "@/types/requests";
import { Form } from "react-bootstrap";
import React, { useId } from "react";
import MultiSelect from "@/components/commons/MultiSelect";

export type SelectProps<T extends SampleFilteringRequest> = {
    options: Option[];
    state: T;
    dispatch: (action: { type: keyof T; payload: any }) => void;
};

export function SubtypesSelect<T extends SampleFilteringRequest>({ options, state, dispatch }: SelectProps<T>) {
    const selectId = useId();
    return (
        <>
            <Form.Label htmlFor={`react-select-${selectId}-input`}>Filter samples by subtype (optional)</Form.Label>
            <MultiSelect<Option>
                instanceId={selectId}
                isClearable
                options={options}
                value={(state.subtypes ?? [])
                    .map((c) => options.find((o) => o.value === c))
                    .filter((o): o is Option => typeof o !== "undefined")}
                onChange={(o) => dispatch({ type: "subtypes", payload: o.map((m) => m.value) })}
            />
        </>
    );
}

export function SampleTypesSelect<T extends SampleFilteringRequest>({ options, state, dispatch }: SelectProps<T>) {
    const selectId = useId();
    return (
        <>
            <Form.Label htmlFor={`react-select-${selectId}-input`}>Filter samples by type (optional)</Form.Label>
            <MultiSelect<Option>
                instanceId={selectId}
                isClearable
                options={options}
                value={(state.sample_types ?? [])
                    .map((c) => options.find((o) => o.value === c))
                    .filter((o): o is Option => typeof o !== "undefined")}
                onChange={(o) => dispatch({ type: "sample_types", payload: o.map((m) => m.value) })}
            />
        </>
    );
}
