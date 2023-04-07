import {
    ColumnDef,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    Row as ReactTableRowType,
    useReactTable,
} from "@tanstack/react-table";
import { ReactNode, useCallback } from "react";
import { Col, Row, Table } from "react-bootstrap";
import {
    Alignment,
    TableBody,
    TableExport,
    TableHeader,
    TablePagination,
    TableSelectItemsPerPage,
    useColumnVisibility,
    useTableColumns,
} from "@/components/DataTable";
import { Simulate } from "react-dom/test-utils";
import error = Simulate.error;
import { formatInteger } from "@/formatters";

type MediaQueryType = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
type CSSSizeType = "minWidth" | "maxWidth" | "width";
type SizeValueType = string | number | undefined;
type SizeType = SizeValueType | { [key in CSSSizeType]?: SizeValueType };

type AlignmentType = Alignment | undefined;

export interface ArrayDataTableProps<R> {
    data: R[];
    idField?: keyof R;
    columns: ColumnDef<R>[];
    expandable?: boolean;
    renderExpandedRow?: (props: { row: ReactTableRowType<R> }) => ReactNode;
    columnsVisibility?: { [column: string]: MediaQueryType };
    columnsSizing?: { [column: string]: SizeType };
    columnsAlignment?: { [column: string]: AlignmentType };
    wrapColumns?: { [column: string]: boolean } | boolean;
    exportable?: boolean;
}

export function DefaultNumberFilter<R>(row: ReactTableRowType<R>, columnId: string, filterValue: any) {
    if (!Array.isArray(filterValue) || filterValue.length !== 2) return true;
    const [operator, value] = filterValue;
    if (operator === "" || value === "") return true;
    const rowValue = Number(row.getValue(columnId));
    const numberValue = Number(value);
    switch (operator) {
        case "=":
            return rowValue === numberValue;
        case ">":
            return rowValue > numberValue;
        case "<":
            return rowValue < numberValue;
        case ">=":
            return rowValue >= numberValue;
        case "<=":
            return rowValue <= numberValue;
    }
    return false;
}

export default function ArrayDataTable<R>({
    data,
    idField,
    columns: columnsProp,
    expandable,
    renderExpandedRow,
    columnsVisibility,
    columnsSizing,
    columnsAlignment,
    wrapColumns,
    exportable = true,
}: ArrayDataTableProps<R>) {
    const columns = useTableColumns(columnsProp, expandable);
    const columnVisibility = useColumnVisibility(columnsVisibility);
    const table = useReactTable({
        data,
        columns,
        state: {
            columnVisibility,
        },
        getRowId: idField ? (row: R) => `${row[idField]}` : undefined,
        getRowCanExpand: expandable ? () => true : undefined,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: expandable ? getExpandedRowModel() : undefined,
    });
    const getData = useCallback(() => data, [data]);
    const { pageIndex, pageSize } = table.getState().pagination;
    const firstItem = Math.max(1, 1 + pageIndex * pageSize);
    const lastItem = Math.min(data.length, (pageIndex + 1) * pageSize);
    return (
        <>
            <Row>
                <Col
                    sm={12}
                    md={6}
                    className="d-flex flex-col justify-content-center justify-content-md-start align-items-center mb-2 mb-sm-0 gap-2"
                >
                    <TableSelectItemsPerPage table={table} />
                </Col>
                {exportable && (
                    <Col
                        sm={12}
                        md={6}
                        className="d-flex justify-content-center justify-content-md-end align-items-center gap-2"
                    >
                        <TableExport getData={getData} />
                    </Col>
                )}
            </Row>
            <Table responsive borderless hover>
                <TableHeader table={table} columnsSizing={columnsSizing} columnsAlignment={columnsAlignment} />
                <TableBody
                    table={table}
                    expandable={expandable}
                    renderExpandedRow={renderExpandedRow}
                    columnsAlignment={columnsAlignment}
                    wrapColumns={wrapColumns}
                />
            </Table>
            <Row className="align-items-center flex-column-reverse flex-md-row">
                <Col className="text-center text-md-start">
                    {!error &&
                        !!data &&
                        `Showing ${formatInteger(firstItem)} to ${formatInteger(lastItem)} of ${formatInteger(
                            data.length,
                        )} entries`}
                </Col>
                <Col className="d-flex justify-content-center justify-content-md-end align-items-end">
                    <TablePagination table={table} pageIndex={pageIndex} />
                </Col>
            </Row>
        </>
    );
}
