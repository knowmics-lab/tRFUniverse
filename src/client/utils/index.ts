import type { BreadcrumbItem, Metadata } from "@/types";
import { RequestError } from "@/errors";

export * from "./Echo";
export * from "./Atoms";
export * from "./pendingAnalyses";
export { default as template } from "./template";
export { default as querySerialize } from "./querySerialize";
export { default as generatePagesList } from "./generatePagesList";

export function apiUrl(endpoint: string) {
    return `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`;
}

export function filterByKeys<T>(obj: { [key: string]: T }, fn: (key: string) => boolean): { [key: string]: T } {
    return Object.entries(obj)
        .filter(([key]) => fn(key))
        .reduce((r, [key, value]) => {
            r[key] = value;
            return r;
        }, {} as { [key: string]: T });
}

export function defaultTitle(title: string) {
    return `tRFUniverse - ${title}`;
}

export function defaultBreadcrumb(text: string): BreadcrumbItem[] {
    return [
        { text: "tRFUniverse", href: "/" },
        { text, active: true },
    ];
}

export function twoLevelBreadcrumb(level1Text: string, level1Href: string, level2Text: string): BreadcrumbItem[] {
    return [
        { text: "tRFUniverse", href: "/" },
        { text: level1Text, href: level1Href },
        { text: level2Text, active: true },
    ];
}

const NUCLEOTIDE_MAP: Record<string, string> = {
    AT: "|",
    TA: "|",
    CG: "|",
    GT: ":",
    GC: "|",
};

export function predictedBindingSite(fragment: string, target: string) {
    const maxLen = Math.max(fragment.length, target.length);
    const fragmentArray = new Array(maxLen);
    const middleArray = new Array(maxLen);
    const targetArray = new Array(maxLen);
    for (let i = 0; i < maxLen; i++) {
        fragmentArray[i] = fragment.charAt(maxLen - i - 1) ?? "-";
        targetArray[i] = target.charAt(i) ?? "-";
        middleArray[i] = NUCLEOTIDE_MAP[`${fragmentArray[i]}${targetArray[i]}`] ?? " ";
    }
    return `Fragment: ${fragmentArray.join("")}\n          ${middleArray.join("")}\nTarget:   ${targetArray.join("")}`;
}

export async function processFetchResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = new RequestError("An error occurred while fetching the data.");
        error.info = await response.json();
        error.status = response.status;
        throw error;
    }
    return await response.json();
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export function pathWithoutHash(path: string) {
    return path.split("#")[0];
}

export function pathWithoutId(path: string) {
    const parts = pathWithoutHash(path).split("/");
    while (parts.length > 0 && !isNaN(Number(parts[parts.length - 1]))) {
        parts.pop();
    }
    return parts.length === 0 ? "/" : parts.join("/");
}

export function filterDatasets(datasets: Metadata, filter: string) {
    const filteredDatasets = Object.entries(datasets.props)
        .filter(([, v]) => typeof v === "object" && !!(v[filter] ?? false))
        .map(([k]) => k);
    return Object.entries(datasets.values).filter(([k]) => filteredDatasets.includes(k));
}
