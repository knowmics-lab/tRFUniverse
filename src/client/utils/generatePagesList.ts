export default function generatePagesList(currentPage: number, totalPages: number): number[] {
    if (totalPages <= 0) return [];
    if (totalPages <= 7) {
        return new Array(totalPages).fill(0).map((_, i) => i + 1);
    }
    const pages = new Array(9).fill(0);
    if (currentPage <= 6) {
        for (let i = 0; i < 6; i++) pages[i] = i + 1;
        pages[6] = -1;
        pages[7] = totalPages - 1;
        pages[8] = totalPages;
    }
    if (currentPage >= totalPages - 5) {
        pages[0] = 1;
        pages[1] = 2;
        pages[2] = -1;
        for (let i = 3; i < 9; i++) pages[i] = totalPages - 8 + i;
    }
    if (currentPage > 6 && currentPage < totalPages - 5) {
        pages[0] = 1;
        pages[1] = 2;
        pages[2] = -1;
        pages[3] = currentPage - 1;
        pages[4] = currentPage;
        pages[5] = currentPage + 1;
        pages[6] = -1;
        pages[7] = totalPages - 1;
        pages[8] = totalPages;
    }
    return pages;
}
