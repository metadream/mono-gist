/**
 * 生成紧凑型页码数组（可用于前端分页显示，0代表省略的页码）
 * @example [1, ..., 8, 9, 10, 11, 12, ..., 20]
 * @param totalPages 总页数
 * @param pageNumber 当前页码
 * @param around 当前页环绕左右最大页码数（默认值 2）
 * @returns
 */
function compact(totalPages: number, pageNumber: number, around = 2): number[] {
    const baseCount = around * 2 + 5;
    const surplus = baseCount - 2;
    const startIndex = 1 + 2 + around + 1;
    const endIndex = totalPages - 2 - around - 1;

    if (totalPages <= baseCount) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (pageNumber < startIndex) {
        return [...Array.from({ length: surplus }, (_, i) => i + 1), 0, totalPages];
    }
    if (pageNumber > endIndex) {
        return [1, 0, ...Array.from({ length: surplus }, (_, i) => totalPages - surplus + i + 1)];
    }
    return [1, 0, ...Array.from({ length: around * 2 + 1 }, (_, i) => pageNumber - around + i), 0, totalPages];
}

/** Pagination metadata computed by {@link paginate}. */
export interface Paging {
    totalSize: number;
    totalPages: number;
    compactPages: number[];
    pageNumber: number;
    begin: number;
    end: number;
    limit: number;
    results?: any[];
}

/** Compute pagination metadata. Page numbers are 1-based. */
export function paginate(totalSize: number, pageSize: number, pageNumber = 1): Paging {
    const totalPages = Math.ceil(totalSize / pageSize);
    const compactPages = compact(totalPages, pageNumber);
    const begin = pageSize * (pageNumber - 1);
    const end = Math.min(pageSize * pageNumber, totalSize);
    const limit = end - begin;
    return { totalSize, totalPages, compactPages, pageNumber, begin, end, limit };
}
