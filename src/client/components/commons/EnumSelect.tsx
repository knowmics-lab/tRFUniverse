import Select, { MultiValue, SingleValue } from "react-select";
import { Option } from "@/types";
import React, { useId, useMemo } from "react";
import { Form } from "react-bootstrap";
import MultiSelect from "@/components/commons/MultiSelect";

type EnumSelectProps<E, S> = {
    options: Option<E>[];
    state: S;
    field: keyof S;
    dispatch: (action: { type: keyof S; payload: any }) => void;
    isMulti?: boolean;
    placeholder: React.ReactNode;
};

export default function EnumSelect<E, S>({
    options,
    state,
    field,
    dispatch,
    isMulti = false,
    placeholder,
}: EnumSelectProps<E, S>) {
    const selectId = useId();
    const selectedValues = useMemo(
        () =>
            isMulti
                ? options.filter((o) => ((state[field] ?? []) as E[]).includes(o.value))
                : options.find((o) => o.value === state[field]),
        [isMulti, options, state, field],
    );
    return (
        <>
            <Form.Label htmlFor={`react-select-${selectId}-input`}>{placeholder}</Form.Label>
            {!isMulti && (
                <Select<Option<E>>
                    instanceId={selectId}
                    isClearable
                    options={options}
                    value={selectedValues}
                    onChange={(m) =>
                        dispatch({
                            type: field,
                            payload: (m as SingleValue<Option<E>>)?.value,
                        })
                    }
                />
            )}
            {isMulti && (
                <MultiSelect<Option<E>>
                    instanceId={selectId}
                    isClearable
                    options={options}
                    value={selectedValues}
                    onChange={(m) =>
                        dispatch({
                            type: field,
                            payload: (m as MultiValue<Option<E>>)?.map((m) => m.value),
                        })
                    }
                />
            )}
        </>
    );
}
