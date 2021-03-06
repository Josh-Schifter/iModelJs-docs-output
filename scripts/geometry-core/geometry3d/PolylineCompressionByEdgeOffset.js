"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
const Point3dVector3d_1 = require("./Point3dVector3d");
const Point3dArrayCarrier_1 = require("./Point3dArrayCarrier");
const Geometry_1 = require("../Geometry");
// cspell:word Puecker
/** context class for Puecker-Douglas polyline compression, viz https://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm
 * @internal
 */
class PolylineCompressionContext {
    /** Caller provides source and tolerance.
     * * pointer to source is retained, but contents of source are never modified.
     */
    constructor(source, dest, tolerance) {
        this._toleranceSquared = tolerance * tolerance;
        this._source = source;
        this._dest = dest;
    }
    /** push (clone of) the point at index i from the source to the growing result.
     * * index is adjusted cyclically to source index range by modulo.
     */
    acceptPointByIndex(i) {
        const point = this._source.getPoint3dAtCheckedPointIndex(this._source.cyclicIndex(i));
        if (point)
            this._dest.push(point);
    }
    /**
     * Return index of max magnitude of cross product of vectors (index to index+1) and (index to index+2)
     * * Return undefined if unable to find a nonzero cross product.
     * @param i0 first cross product central index.
     * @param i1 last cross product central index.
     */
    indexOfMaxCrossProduct(index0, index1) {
        let qMax = 0.0;
        let q;
        let indexMax;
        for (let index = index0; index <= index1; index++) {
            const iA = this._source.cyclicIndex(index);
            const iB = this._source.cyclicIndex(index + 1);
            const iC = this._source.cyclicIndex(index + 2);
            this._source.crossProductIndexIndexIndex(iA, iB, iC, PolylineCompressionContext._vectorQ);
            q = PolylineCompressionContext._vectorQ.magnitudeSquared();
            if (q > qMax) {
                qMax = q;
                indexMax = index;
            }
        }
        return indexMax;
    }
    /**
     * Return interior index where max deviation in excess of tolerance occurs.
     * @param i0 first index of interval
     * @param i1 INCLUSIVE final index
     */
    indexOfMaxDeviation(index0, index1) {
        const i0 = this._source.cyclicIndex(index0);
        const i1 = this._source.cyclicIndex(index1);
        let maxDeviation = this._toleranceSquared;
        let maxDeviationIndex;
        let numerator;
        let distanceSquared;
        let s;
        let i;
        this._source.vectorIndexIndex(i0, i1, PolylineCompressionContext._vector01);
        const denominator = PolylineCompressionContext._vector01.magnitudeSquared();
        for (let index = index0 + 1; index < index1; index++) {
            i = this._source.cyclicIndex(index);
            this._source.vectorIndexIndex(i0, i, PolylineCompressionContext._vectorQ);
            numerator = PolylineCompressionContext._vector01.dotProduct(PolylineCompressionContext._vectorQ);
            if (numerator <= 0) {
                distanceSquared = PolylineCompressionContext._vectorQ.magnitudeSquared();
            }
            else if (numerator > denominator) {
                this._source.vectorIndexIndex(i1, i, PolylineCompressionContext._vectorQ);
                distanceSquared = PolylineCompressionContext._vectorQ.magnitudeSquared();
            }
            else {
                s = numerator / denominator;
                distanceSquared = PolylineCompressionContext._vectorQ.magnitudeSquared() - denominator * s * s;
            }
            if (distanceSquared > maxDeviation) {
                maxDeviation = distanceSquared;
                maxDeviationIndex = index;
            }
        }
        return maxDeviationIndex;
    }
    /**
     *
     * @param i0 first active point index
     * @param i1 last active point index (INCLUSIVE -- not "one beyond")
     * @param chordTolerance
     * @param result
     */
    // ASSUME index i0 is already saved.
    // ASSUME point i
    recursiveCompressByChordErrorGo(i0, i1) {
        if (i1 === i0 + 1) {
            this.acceptPointByIndex(i1);
            return;
        }
        const distantPointIndex = this.indexOfMaxDeviation(i0, i1);
        if (distantPointIndex === undefined) {
            this.acceptPointByIndex(i1); // which compresses out some points.
        }
        else {
            this.recursiveCompressByChordErrorGo(i0, distantPointIndex);
            this.recursiveCompressByChordErrorGo(distantPointIndex, i1);
        }
    }
    // cspell:word Peucker
    /**
     * Return a point array with a subset of the input points.
     * * This is a global analysis (Douglas-Peucker)
     * @param source input points.
     * @param chordTolerance Points less than this distance from a retained edge may be ignored.
     */
    static compressPoint3dArrayByChordError(source, chordTolerance) {
        const source1 = new Point3dArrayCarrier_1.Point3dArrayCarrier(source);
        const dest1 = new Point3dArrayCarrier_1.Point3dArrayCarrier([]);
        this.compressCollectionByChordError(source1, dest1, chordTolerance);
        return dest1.data;
    }
    /**
     * * Return a polyline with a subset of the input points.
     * * This is a global analysis (Douglas-Peucker)
     * * Global search for vertices that are close to edges between widely separated neighbors.
     * * Recurses to smaller subsets.
     * @param source input points
     * @param dest output points.  Must be different from source.
     * @param chordTolerance Points less than this distance from a retained edge may be ignored.
     */
    static compressCollectionByChordError(source, dest, chordTolerance) {
        dest.clear();
        const n = source.length;
        if (n === 1) {
            dest.push(source.getPoint3dAtCheckedPointIndex(0));
            return;
        }
        const context = new PolylineCompressionContext(source, dest, chordTolerance);
        // Do compression on inclusive interval from indexA to indexB, with indices interpreted cyclically if closed
        let indexA = 0;
        let indexB = n - 1;
        if (n > 2 && source.distanceIndexIndex(0, n - 1) <= chordTolerance) {
            // cyclic data. It is possible that the wrap point itself has to be seen as an internal point.
            // do the search from point index where there is a large triangle . ..
            const maxCrossProductIndex = context.indexOfMaxCrossProduct(0, n - 1);
            if (maxCrossProductIndex !== undefined) {
                indexA = maxCrossProductIndex + 1;
                indexB = indexA + n;
            }
        }
        context.acceptPointByIndex(indexA);
        context.recursiveCompressByChordErrorGo(indexA, indexB);
    }
    /** Copy points from source to dest, omitting those too close to predecessor.
     * * First and last points are always preserved.
     */
    static compressInPlaceByShortEdgeLength(data, edgeLength) {
        const n = data.length;
        if (n < 2)
            return;
        let lastAcceptedIndex = 0;
        // back up from final point ..
        let indexB = n - 1;
        while (indexB > 0 && data.distanceIndexIndex(indexB - 1, n - 1) < edgeLength)
            indexB--;
        if (indexB === 0) {
            // Theres only one point there.
            data.length = 1;
            return;
        }
        // we want the exact bits of the final point even if others were nearby ..
        if (indexB < n - 1)
            data.moveIndexToIndex(n - 1, indexB);
        let candidateIndex = lastAcceptedIndex + 1;
        while (candidateIndex <= indexB) {
            if (data.distanceIndexIndex(lastAcceptedIndex, candidateIndex) >= edgeLength) {
                data.moveIndexToIndex(candidateIndex, lastAcceptedIndex + 1);
                lastAcceptedIndex++;
            }
            candidateIndex++;
        }
        data.length = lastAcceptedIndex + 1;
    }
    /** Copy points from source to dest, omitting those too close to predecessor.
     * * First and last points are always preserved.
     */
    static compressInPlaceBySmallTriangleArea(data, triangleArea) {
        const n = data.length;
        if (n < 3)
            return;
        let lastAcceptedIndex = 0;
        const cross = Point3dVector3d_1.Vector3d.create();
        for (let i1 = 1; i1 + 1 < n; i1++) {
            data.crossProductIndexIndexIndex(lastAcceptedIndex, i1, i1 + 1, cross);
            if (0.5 * cross.magnitude() > triangleArea) {
                data.moveIndexToIndex(i1, ++lastAcceptedIndex);
            }
        }
        data.moveIndexToIndex(n - 1, ++lastAcceptedIndex);
        data.length = lastAcceptedIndex + 1;
    }
    /** Copy points from source to dest, omitting those too close to edge between neighbors.
     * * First and last points are always preserved.
     */
    static compressInPlaceByPerpendicularDistance(data, perpendicularDistance, maxExtensionFraction = 1.0001) {
        const n = data.length;
        if (n < 3)
            return;
        let lastAcceptedIndex = 0;
        const vector01 = PolylineCompressionContext._vector01;
        const vectorQ = PolylineCompressionContext._vectorQ;
        let distanceSquared;
        const perpendicularDistanceSquared = perpendicularDistance * perpendicularDistance;
        let denominator;
        let i1 = 1;
        for (; i1 + 1 < n; i1++) {
            data.vectorIndexIndex(lastAcceptedIndex, i1 + 1, vector01);
            data.vectorIndexIndex(lastAcceptedIndex, i1, vectorQ);
            denominator = vector01.magnitudeSquared();
            const s = Geometry_1.Geometry.conditionalDivideFraction(vectorQ.dotProduct(vector01), denominator);
            if (s !== undefined) {
                if (s >= 0.0 && s <= maxExtensionFraction) {
                    distanceSquared = PolylineCompressionContext._vectorQ.magnitudeSquared() - denominator * s * s;
                    if (distanceSquared <= perpendicularDistanceSquared) {
                        // force accept of point i1+1 .
                        data.moveIndexToIndex(i1 + 1, ++lastAcceptedIndex);
                        i1 = i1 + 1;
                        continue;
                    }
                }
            }
            data.moveIndexToIndex(i1, ++lastAcceptedIndex);
        }
        if (i1 < n)
            data.moveIndexToIndex(i1, ++lastAcceptedIndex);
        data.length = lastAcceptedIndex + 1;
    }
}
exports.PolylineCompressionContext = PolylineCompressionContext;
/** work data used by find max deviation */
PolylineCompressionContext._vector01 = Point3dVector3d_1.Vector3d.create();
PolylineCompressionContext._vectorQ = Point3dVector3d_1.Vector3d.create();
//# sourceMappingURL=PolylineCompressionByEdgeOffset.js.map