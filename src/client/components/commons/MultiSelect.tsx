// noinspection JSUnusedGlobalSymbols

import Select, { components, GroupBase, Props, ValueContainerProps } from "react-select";
import React from "react";

function ValueContainer<Option = unknown, Group extends GroupBase<Option> = GroupBase<Option>>({
    children,
    getValue,
    ...props
}: ValueContainerProps<Option, true, Group>) {
    const values = getValue();
    const valueLabel = values.map((v) => props.selectProps.getOptionLabel(v)).join(", ");
    const childrenToRender = React.Children.toArray(children).filter(
        (child: any) =>
            ["Input", "DummyInput", "Placeholder"].indexOf(child?.type?.name) >= 0 ||
            ["-input", "-placeholder"].some((k) => child?.props?.id?.endsWith?.(k)),
    );
    return (
        <components.ValueContainer {...props} getValue={getValue}>
            <div
                style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {!props.selectProps.inputValue && valueLabel}
            </div>
            {childrenToRender}
        </components.ValueContainer>
    );
}

type MultiSelectProps<Option = unknown, Group extends GroupBase<Option> = GroupBase<Option>> = Omit<
    Props<Option, true, Group>,
    "hideSelectedOptions" | "isMulti"
>;

export default function MultiSelect<Option = unknown, Group extends GroupBase<Option> = GroupBase<Option>>({
    components,
    styles,
    ...props
}: MultiSelectProps<Option, Group>) {
    return (
        <Select<Option, true, Group>
            hideSelectedOptions={false}
            isMulti
            components={{
                ...(components ?? {}),
                ValueContainer,
            }}
            styles={{
                ...(styles ?? {}),
                valueContainer: (base) => ({
                    ...base,
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    alignItems: "center",
                }),
                placeholder: (base) => ({
                    ...base,
                    userSelect: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }),
            }}
            {...props}
        />
    );
}
