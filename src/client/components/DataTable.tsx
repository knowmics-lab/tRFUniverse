import { QueryRequest } from "@/types/requests";
import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    PaginationState,
    Row as ReactTableRowType,
    SortingState,
    Table as ReactTableType,
    useReactTable,
} from "@tanstack/react-table";
import { generatePagesList, template } from "@/utils";
import useSWR from "swr";
import { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { tableFetcher } from "@/fetchers";
import { Button, ButtonGroup, Col, Form, Pagination, Row, Spinner, Table } from "react-bootstrap";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortDown, faSortUp, faSquareMinus, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";
import { PaginatedDataListResponse } from "@/types";
import useMediaQueries from "@/hooks/commons/useMediaQuery";
import XLSX from "xlsx";
import fileDownload from "js-file-download";
import { formatInteger } from "@/formatters";
import { usePreviousDistinct } from "react-use";

export type MakeQueryRequestType<Q extends QueryRequest> = (
    page: number,
    rowsPerPage: number,
    sort: SortingState,
    filters: ColumnFiltersState,
) => Q;
type MediaQueryType = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
type CSSSizeType = "minWidth" | "maxWidth" | "width";
type SizeValueType = string | number | undefined;
type SizeType = SizeValueType | { [key in CSSSizeType]?: SizeValueType };

export enum Alignment {
    LEFT = "text-left",
    CENTER = "text-center",
    RIGHT = "text-right",
    JUSTIFY = "text-justify",
}

type AlignmentType = Alignment | undefined;

export interface BrowseTableProps<R, Q extends QueryRequest> {
    url: string | ReturnType<typeof template<Q>>;
    idField?: keyof R;
    columns: ColumnDef<R>[];
    defaultSorting?: SortingState;
    makeQueryRequest?: MakeQueryRequestType<Q>;
    method?: "GET" | "POST";
    excludeKeys?: (keyof Q)[];
    expandable?: boolean;
    renderExpandedRow?: (props: { row: ReactTableRowType<R> }) => ReactNode;
    columnsVisibility?: { [column: string]: MediaQueryType };
    columnsSizing?: { [column: string]: SizeType };
    columnsAlignment?: { [column: string]: AlignmentType };
    wrapColumns?: { [column: string]: boolean } | boolean;
    exportable?: boolean;
}

type TableHeaderProps<R> = {
    table: ReactTableType<R>;
    columnsSizing?: { [column: string]: SizeType };
    columnsAlignment?: { [column: string]: AlignmentType };
};
type TableBodyProps<R> = {
    table: ReactTableType<R>;
    expandable?: boolean;
    renderExpandedRow?: (props: { row: ReactTableRowType<R> }) => ReactNode;
    columnsAlignment?: { [column: string]: AlignmentType };
    wrapColumns?: { [column: string]: boolean } | boolean;
};
type TableFooterProps<R> = {
    table: ReactTableType<R>;
    columnsAlignment?: { [column: string]: AlignmentType };
};

export const FIRST_PAGE = 1;
export const ROWS_PER_PAGE = 10;
export const ROWS_PER_PAGE_OPTIONS = [10, 15, 20, 50, 100];
export const NUMBER_OPERATOR_OPTIONS = ["<", "<=", "=", ">=", ">"];
export const MEDIA_SIZES = ["xs", "sm", "md", "lg", "xl", "xxl"] as MediaQueryType[];
export const MEDIA_QUERIES = [
    "(min-width: 0px)",
    "(min-width: 576px)",
    "(min-width: 768px)",
    "(min-width: 992px)",
    "(min-width: 1200px)",
    "(min-width: 1400px)",
];
export const DEFAULT_MAKE_QUERY_REQUEST: MakeQueryRequestType<any> = (page, per_page, sort, filters) => ({
    page,
    per_page,
    sort: sort.reduce(
        (o, { id, desc }) => ({
            ...o,
            [id]: desc ? "desc" : "asc",
        }),
        {},
    ),
    search: filters
        .filter(
            ({ value }) =>
                (!Array.isArray(value) && !!value) ||
                (Array.isArray(value) && value.length == 2 && !!value[0] && !!value[1]),
        )
        .reduce(
            (o, { id, value }) => ({
                ...o,
                [id]: value,
            }),
            {},
        ),
});

function toNumber(n: any, defaultValue = 0): number {
    const parsedNumber = Number(Array.isArray(n) ? n[0] : n);
    return isNaN(parsedNumber) ? defaultValue : parsedNumber;
}

function getColumnSize(column: string, columnsSizing: { [column: string]: SizeType } = {}) {
    const sizeDetail = columnsSizing[column] ?? undefined;
    if (!sizeDetail) return {};
    if (typeof sizeDetail === "string" || typeof sizeDetail === "number") return { width: sizeDetail };
    return sizeDetail;
}

function isColumnWrapped(column: string, wrapColumns?: { [column: string]: boolean } | boolean | undefined) {
    if (!wrapColumns) return false;
    if (typeof wrapColumns === "boolean") return wrapColumns;
    return wrapColumns[column] ?? false;
}

function getColumnAlignmentClass(column: string, columnsAlignment: { [column: string]: AlignmentType } = {}) {
    const alignmentDetail = columnsAlignment[column] ?? undefined;
    if (!alignmentDetail) return {};
    return `${alignmentDetail}`;
}

function getSortingImage<R>(column: Column<R>) {
    const isSorted = column.getIsSorted();
    if (isSorted === false) return faSort;
    return isSorted === "asc" ? faSortUp : faSortDown;
}

export function useTableColumns<R>(columns: ColumnDef<R>[], expandable?: boolean) {
    return useMemo<ColumnDef<R>[]>(() => {
        if (!expandable) return columns;
        return [
            {
                id: "expander",
                header: () => null,
                footer: () => null,
                cell: ({ row }) => {
                    if (!row.getCanExpand()) return null;
                    return (
                        <button
                            className="btn btn-sm btn-link cursor-pointer text-secondary p-0 m-0"
                            onClick={row.getToggleExpandedHandler()}
                        >
                            <FontAwesomeIcon icon={row.getIsExpanded() ? faSquareMinus : faSquarePlus} />
                        </button>
                    );
                },
            },
            ...columns,
        ];
    }, [columns, expandable]);
}

function useDefaultPaginationState(): PaginationState {
    const { page = FIRST_PAGE, per_page = ROWS_PER_PAGE } = useRouter().query;
    return useMemo(
        () => ({
            pageIndex: toNumber(page, FIRST_PAGE) - 1,
            pageSize: toNumber(per_page, ROWS_PER_PAGE),
        }),
        [page, per_page],
    );
}

function useTableData<R>(data: PaginatedDataListResponse<R> | undefined) {
    const defaultData = useMemo(() => [], []);
    const prevData = usePreviousDistinct(data);
    return {
        data: data?.data ?? prevData?.data ?? defaultData,
        meta: data?.meta ??
            prevData?.meta ?? {
                current_page: 0,
                last_page: -1,
                per_page: ROWS_PER_PAGE,
                from: 0,
                to: 0,
                total: 0,
                path: "",
                links: [],
            },
    };
}

export function useColumnVisibility(columnsVisibility?: { [column: string]: MediaQueryType }) {
    const mediaQueries = useMediaQueries(MEDIA_QUERIES).reduce((acc, value, index) => {
        acc[MEDIA_SIZES[index]] = value;
        return acc;
    }, {} as { [key in MediaQueryType]: boolean });
    return Object.entries(columnsVisibility ?? {}).reduce((acc, [column, mediaQuery]) => {
        acc[column] = mediaQueries[mediaQuery as MediaQueryType];
        return acc;
    }, {} as Record<string, boolean>);
}

function Filter<R>({ column, table }: { column: Column<R, any>; table: ReactTableType<R> }) {
    const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

    return (
        <>
            {typeof firstValue === "number" && (
                <div className="d-flex align-items-center justify-content-between">
                    <Form.Select
                        size="sm"
                        className="w-25"
                        value={((column.getFilterValue() as any)?.[0] ?? "") as string}
                        onChange={(e) => column.setFilterValue((old: any) => [e.target.value, old?.[1] ?? ""])}
                        aria-label="Select an operator"
                    >
                        <option value="">None</option>
                        {NUMBER_OPERATOR_OPTIONS.map((operator) => (
                            <option key={operator} value={operator}>
                                {operator}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control
                        size="sm"
                        type="number"
                        value={((column.getFilterValue() as any)?.[1] ?? "") as string}
                        onChange={(e) => column.setFilterValue((old: any) => [old?.[0] ?? "", e.target.value])}
                        placeholder="Search..."
                    />
                </div>
            )}
            {typeof firstValue !== "number" && (
                <Form.Control
                    size="sm"
                    type="text"
                    value={(column.getFilterValue() ?? "") as string}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    placeholder="Search..."
                />
            )}
        </>
    );
}

export function TableSelectItemsPerPage<R>({ table }: { table: ReactTableType<R> }) {
    return (
        <>
            <div>Show</div>
            <Form.Select
                size="sm"
                style={{ maxWidth: "60px" }}
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                }}
            >
                {ROWS_PER_PAGE_OPTIONS.map((pageSize) => (
                    <option key={`rows-per-page-option-${pageSize}`} value={pageSize}>
                        {pageSize}
                    </option>
                ))}
            </Form.Select>
            <div>entries</div>
        </>
    );
}

export function TableExport<R>({ getData }: { getData: () => R[] }) {
    const exportCSV = useCallback(() => {
        const ws = XLSX.utils.json_to_sheet(getData());
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "data.csv", { bookType: "csv" });
    }, [getData]);
    const exportXLSX = useCallback(() => {
        const ws = XLSX.utils.json_to_sheet(getData());
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "data.xlsx");
    }, [getData]);
    const exportJSON = useCallback(() => {
        fileDownload(JSON.stringify(getData()), "data.json");
    }, [getData]);
    return (
        <>
            <div aria-hidden>Export table in</div>
            <ButtonGroup aria-label="Export table in">
                <Button className="mb-0" variant="primary" onClick={exportCSV}>
                    CSV
                </Button>
                <Button className="mb-0" variant="primary" onClick={exportXLSX}>
                    Excel
                </Button>
                <Button className="mb-0" variant="primary" onClick={exportJSON}>
                    JSON
                </Button>
            </ButtonGroup>
        </>
    );
}

export function TableHeader<R>({ table, columnsSizing, columnsAlignment }: TableHeaderProps<R>) {
    return (
        <thead>
            {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <th
                            key={header.id}
                            colSpan={header.colSpan}
                            style={{
                                ...getColumnSize(header.id, columnsSizing),
                            }}
                        >
                            {header.isPlaceholder ? null : (
                                <div className="d-flex flex-column">
                                    <div
                                        className={clsx("d-flex align-items-center justify-content-between", {
                                            "cursor-pointer user-select-none": header.column.getCanSort(),
                                        })}
                                        title={header.column.getCanSort() ? "Click to sort" : undefined}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div
                                            className={clsx(
                                                "flex-grow-1",
                                                getColumnAlignmentClass(header.id, columnsAlignment),
                                            )}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </div>
                                        {header.column.getCanSort() && (
                                            <div>
                                                <FontAwesomeIcon icon={getSortingImage(header.column)} />
                                            </div>
                                        )}
                                    </div>
                                    {header.column.getCanFilter() ? (
                                        <div>
                                            <Filter column={header.column} table={table} />
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </th>
                    ))}
                </tr>
            ))}
        </thead>
    );
}

export function TableBody<R>({
    table,
    expandable,
    renderExpandedRow,
    columnsAlignment,
    wrapColumns,
}: TableBodyProps<R>) {
    const headersCount = useMemo(
        () =>
            table
                .getHeaderGroups()
                .map((hg) => hg.headers.reduce((acc, h) => acc + h.colSpan, 0))
                .reduce((acc, v) => Math.max(acc, v), -1),
        [table],
    );
    return (
        <tbody>
            {table.getRowModel().rows.length === 0 && (
                <tr>
                    <td colSpan={headersCount} className="text-center">
                        There are no records to display.
                    </td>
                </tr>
            )}
            {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                    <tr>
                        {row.getVisibleCells().map((cell) => (
                            <td
                                key={cell.id}
                                className={clsx(
                                    {
                                        "text-wrap": isColumnWrapped(cell.column.id, wrapColumns),
                                        "text-break": isColumnWrapped(cell.column.id, wrapColumns),
                                    },
                                    getColumnAlignmentClass(cell.column.id, columnsAlignment),
                                )}
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                    {expandable && renderExpandedRow && row.getIsExpanded() && (
                        <tr>
                            <td colSpan={row.getVisibleCells().length}>{renderExpandedRow({ row })}</td>
                        </tr>
                    )}
                </Fragment>
            ))}
        </tbody>
    );
}

export function TableFooter<R>({ table, columnsAlignment }: TableFooterProps<R>) {
    return (
        <tfoot>
            {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                    {footerGroup.headers.map((header) => (
                        <th
                            key={header.id}
                            colSpan={header.colSpan}
                            className={clsx(getColumnAlignmentClass(header.id, columnsAlignment))}
                        >
                            {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.footer, header.getContext())}
                        </th>
                    ))}
                </tr>
            ))}
        </tfoot>
    );
}

export function TablePagination<R>({ pageIndex, table }: { table: ReactTableType<R>; pageIndex: number }) {
    return (
        <Pagination>
            <Pagination.First onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} />
            <Pagination.Prev onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
            {generatePagesList(pageIndex + 1, table.getPageCount()).map((page, idx) => (
                <Fragment key={`page-${page}-${idx}`}>
                    {page === -1 && <Pagination.Ellipsis className="d-none d-md-flex" />}
                    {page !== -1 && (
                        <Pagination.Item
                            className="d-none d-md-flex"
                            onClick={() => table.setPageIndex(page - 1)}
                            active={page === pageIndex + 1}
                        >
                            {formatInteger(page)}
                        </Pagination.Item>
                    )}
                </Fragment>
            ))}
            <Pagination.Next onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
            <Pagination.Last
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
            />
        </Pagination>
    );
}

export default function DataTable<R, Q extends QueryRequest = QueryRequest>({
    url,
    idField,
    columns,
    makeQueryRequest = DEFAULT_MAKE_QUERY_REQUEST,
    method = "GET",
    defaultSorting = [],
    excludeKeys,
    expandable,
    renderExpandedRow,
    columnsVisibility,
    columnsSizing,
    columnsAlignment,
    wrapColumns,
    exportable = false,
}: BrowseTableProps<R, Q>) {
    const memoizedMakeQueryRequest = useMemo(() => makeQueryRequest, [makeQueryRequest]);
    const tableColumns = useTableColumns(columns, expandable);
    const defaultPaginationState = useDefaultPaginationState();
    const columnVisibility = useColumnVisibility(columnsVisibility);
    const [columnFiltersState, setColumnFiltersState] = useState<ColumnFiltersState>([]);
    const [sortState, setSortState] = useState<SortingState>(defaultSorting);
    const [pagination, setPagination] = useState<PaginationState>(defaultPaginationState);
    const { pageIndex, pageSize } = pagination;

    const queryRequest = useMemo(
        () => memoizedMakeQueryRequest(pageIndex + 1, pageSize, sortState, columnFiltersState),
        [memoizedMakeQueryRequest, pageIndex, pageSize, sortState, columnFiltersState],
    );
    useEffect(() => {
        setPagination(defaultPaginationState);
    }, [defaultPaginationState]);
    const { data: requestData, error } = useSWR(
        {
            url,
            values: queryRequest,
            excludeKeys,
            method,
        },
        tableFetcher as typeof tableFetcher<Q, R>,
    );
    const { data, meta } = useTableData(requestData);
    const getData = useCallback(() => data, [data]);
    const table = useReactTable({
        data: data,
        columns: tableColumns,
        pageCount: meta.last_page,
        state: {
            pagination,
            sorting: sortState,
            columnFilters: columnFiltersState,
            columnVisibility,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSortState,
        onColumnFiltersChange: setColumnFiltersState,
        getRowId: idField ? (row: R) => `${row[idField]}` : undefined,
        getRowCanExpand: expandable ? () => true : undefined,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: expandable ? getExpandedRowModel() : undefined,
        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,
    });

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
                <Col
                    sm={12}
                    md={6}
                    className="d-flex justify-content-center justify-content-md-end align-items-center gap-2"
                >
                    {!error && !requestData && (
                        <>
                            <div>
                                <Spinner animation="border" size="sm" />
                            </div>
                            <div className="ms-2">Loading...</div>
                        </>
                    )}
                    {!!error && !requestData && <div className="text-danger text-bolder">{`${error}`}</div>}
                    {exportable && !!requestData && <TableExport getData={getData} />}
                </Col>
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
                <TableFooter table={table} columnsAlignment={columnsAlignment} />
            </Table>
            <Row className="align-items-center flex-column-reverse flex-md-row">
                <Col className="text-center text-md-start">
                    {!error &&
                        !!data &&
                        `Showing ${formatInteger(meta.from)} to ${formatInteger(meta.to)} of ${formatInteger(
                            meta.total,
                        )} entries`}
                </Col>
                <Col className="d-flex justify-content-center justify-content-md-end align-items-end">
                    <TablePagination table={table} pageIndex={pageIndex} />
                </Col>
            </Row>
        </>
    );
}
