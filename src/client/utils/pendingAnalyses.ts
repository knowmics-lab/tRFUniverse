import { PendingAnalysis } from "@/types";

export function getPendingAnalyses(): PendingAnalysis[] {
    return JSON.parse(localStorage.getItem("pendingAnalyses") ?? "[]");
}

export function storePendingAnalyses(analyses: PendingAnalysis[]) {
    if (analyses.length === 0) {
        localStorage.removeItem("pendingAnalyses");
    } else {
        localStorage.setItem("pendingAnalyses", JSON.stringify(analyses));
    }
    notifyPendingAnalysesChange();
}

export function pushPendingAnalysis(pendingAnalysis: PendingAnalysis) {
    const analyses = getPendingAnalyses();
    analyses.push(pendingAnalysis);
    storePendingAnalyses(analyses);
}

export function removePendingAnalysis(id?: string) {
    if (!id) return;
    const analyses = getPendingAnalyses();
    storePendingAnalyses(analyses.filter((a) => a.id !== id));
}

export function notifyPendingAnalysesChange() {
    window.dispatchEvent(new Event("updatePendingAnalyses"));
}
