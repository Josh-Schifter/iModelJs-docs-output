import { Range2d, Range3d } from "../../geometry3d/Range";
import { LowAndHighXY } from "../../geometry3d/XYZProps";
import { IndexedXYZCollection } from "../../geometry3d/IndexedXYZCollection";
/** Type for a value which may be either (a) undefined or (b) an array of type []. */
export declare type OptionalArray<T> = T[] | undefined;
/**
 * Arrays of type T values distributed by xy position when entered.
 * @internal
 */
export declare class XYIndexGrid<T> {
    private _range;
    private _numXEdge;
    private _numYEdge;
    private _data;
    protected constructor(range: Range2d, numX: number, numY: number);
    /** Return the number of x edges in the grid */
    readonly numXEdge: number;
    /** Return the number of y edges in the grid */
    readonly numYEdge: number;
    /** Return the `i` index of cells containing x coordinate */
    xIndex(x: number): number;
    /** Return the `j` index of cells containing x coordinate */
    yIndex(y: number): number;
    /**
     * Construct an array with cells mapped to a range, with counts determined by estimated total count and target number of entries per cell.
     * @param range
     * @param totalEntries
     * @param targetEntriesPerCell
     */
    static createWithEstimatedCounts<T>(range: LowAndHighXY, totalEntries: number, targetEntriesPerCell: number): XYIndexGrid<T> | undefined;
    /**
     * Add (save) a new data value to the grid cell containing x,y
     * @param x
     * @param y
     * @param value
     */
    addDataAtXY(x: number, y: number, value: T): void;
    /**
     * Get the (reference to the possibly null array of) data values for the cell indicated by xy.
     * @param x
     * @param y
     */
    getDataAtXY(x: number, y: number): OptionalArray<T>;
    /**
     * Get the (reference to the possibly null array of) data values for the cell indicated by indices in the x and y direction
     * @param xIndex
     * @param yIndex
     */
    getDataAtIndex(xIndex: number, yIndex: number): OptionalArray<T>;
    /** Return true if (xIndex, yIndex) is a valid cell index. */
    isValidIndex(xIndex: number, yIndex: number): boolean;
}
/** Manage buckets of points for fast search.
 * @internal
 */
export declare class XYPointBuckets {
    private _points;
    private _buckets;
    /** Return the underlying grid with indices recorded by block */
    readonly indexGrid: XYIndexGrid<number>;
    private constructor();
    /** Create an XYIndex grid with all indices of all `points` entered */
    static create(points: IndexedXYZCollection, targetPointsPerCell: number): XYPointBuckets | undefined;
    /** call the `announce` function with the index and coordinates of all points in given range.
     * * continue the search if `announce` returns true.
     * * terminate the search if `announce` returns false;
     */
    announcePointsInRange(range: Range2d | Range3d, announce: (index: number, x: number, y: number, z: number) => boolean): void;
}
//# sourceMappingURL=XYPointBuckets.d.ts.map