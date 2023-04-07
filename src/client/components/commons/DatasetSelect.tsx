import Select from "react-select";
import { Option } from "@/types";
import React, { useId, useMemo } from "react";
import { Form } from "react-bootstrap";

type Content<T extends true | false = false> = T extends true ? string[] : string;

type MetadataSelectProps<T extends true | false = false> = {
    placeholder?: string;
    datasets: Option[];
    isMulti: T;
    dispatch: (datasets: Content<T>) => void;
    selection?: Content<T>;
};

export default function DatasetSelect<T extends true | false = false>({
    placeholder = "Select a dataset",
    datasets,
    isMulti,
    selection,
    dispatch,
}: MetadataSelectProps<T>) {
    const selectId = useId();
    const datasetValue = useMemo(() => {
        return isMulti
            ? datasets.filter((d) => selection?.includes(d.value) ?? false)
            : datasets.find((d) => d.value === selection);
    }, [isMulti, datasets, selection]);
    return (
        <>
            <Form.Label htmlFor={`react-select-${selectId}-input`}>{placeholder}</Form.Label>
            <Select<Option, T>
                instanceId={selectId}
                isClearable
                isMulti={isMulti}
                options={datasets}
                value={datasetValue}
                onChange={(d) =>
                    dispatch((isMulti ? (d as Option[])?.map((m) => m.value) : (d as Option)?.value) as Content<T>)
                }
            />
        </>
    );
}
