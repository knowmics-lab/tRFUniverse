import Select from "react-select";
import { Metadata } from "@/types";
import React, { useId, useMemo } from "react";
import { Form } from "react-bootstrap";
import MultiSelect from "@/components/commons/MultiSelect";

type MetadataSelectProps<T extends true | false = false> = {
    placeholder?: string;
    metadata: Metadata[];
    isMulti: T;
    dispatch: (action: { type: "metadata"; payload: T extends true ? string[] : string }) => void;
    selection?: T extends true ? string[] : string;
};

export default function MetadataSelect<T extends true | false = false>({
    placeholder = "Select metadata (optional)",
    metadata,
    isMulti,
    selection,
    dispatch,
}: MetadataSelectProps<T>) {
    const selectId = useId();
    const metadataValue = useMemo(() => {
        return isMulti
            ? metadata.filter((m) => selection?.includes(m.name) ?? false)
            : metadata.find((m) => m.name === selection);
    }, [isMulti, metadata, selection]);
    return (
        <>
            <Form.Label htmlFor={`react-select-${selectId}-input`}>{placeholder}</Form.Label>
            {!isMulti && (
                <Select<Metadata>
                    instanceId={selectId}
                    isClearable
                    options={metadata}
                    getOptionLabel={(m) => m.display_name}
                    getOptionValue={(m) => m.name}
                    value={metadataValue}
                    onChange={(m) =>
                        dispatch({
                            type: "metadata",
                            payload: (m as Metadata)?.name as unknown as T extends true ? string[] : string,
                        })
                    }
                />
            )}
            {isMulti && (
                <MultiSelect<Metadata>
                    instanceId={selectId}
                    isClearable
                    options={metadata}
                    getOptionLabel={(m) => m.display_name}
                    getOptionValue={(m) => m.name}
                    value={metadataValue}
                    onChange={(m) =>
                        dispatch({
                            type: "metadata",
                            payload: (m as Metadata[])?.map((m) => m.name) as unknown as T extends true
                                ? string[]
                                : string,
                        })
                    }
                />
            )}
        </>
    );
}
