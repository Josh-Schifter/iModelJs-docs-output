"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const ClipPlane_1 = require("../clipping/ClipPlane");
const ConvexClipPlaneSet_1 = require("../clipping/ConvexClipPlaneSet");
const GrowableXYZArray_1 = require("../geometry3d/GrowableXYZArray");
const PolyfaceBuilder_1 = require("./PolyfaceBuilder");
const Point3dVector3d_1 = require("../geometry3d/Point3dVector3d");
const ChainMerge_1 = require("../topology/ChainMerge");
const SweepContour_1 = require("../solid/SweepContour");
const PolygonOps_1 = require("../geometry3d/PolygonOps");
const Range_1 = require("../geometry3d/Range");
const PolyfaceQuery_1 = require("./PolyfaceQuery");
const RangeSearch_1 = require("./multiclip/RangeSearch");
/** PolyfaceClip is a static class gathering operations using Polyfaces and clippers.
 * @public
 */
class PolyfaceClip {
    /** Clip each facet of polyface to the ClipPlane.
     * * Return all surviving clip as a new mesh.
     * * WARNING: The new mesh is "points only".
     */
    static clipPolyfaceClipPlaneWithClosureFace(polyface, clipper, insideClip = true, buildClosureFace = true) {
        const visitor = polyface.createVisitor(0);
        const builder = PolyfaceBuilder_1.PolyfaceBuilder.create();
        const chainContext = ChainMerge_1.ChainMergeContext.create();
        const work = new GrowableXYZArray_1.GrowableXYZArray(10);
        const point0 = Point3dVector3d_1.Point3d.create();
        const point1 = Point3dVector3d_1.Point3d.create();
        for (visitor.reset(); visitor.moveToNextFacet();) {
            clipper.clipConvexPolygonInPlace(visitor.point, work, insideClip);
            if (visitor.point.length > 2)
                builder.addPolygonGrowableXYZArray(visitor.point);
            this.collectEdgesOnPlane(visitor.point, clipper, chainContext, point0, point1);
        }
        // SweepContour is your friend .. but maybe it doesn't do holes and multi-loops yet?
        if (buildClosureFace) {
            const outwardNormal = clipper.getPlane3d().getNormalRef().scale(-1.0);
            chainContext.clusterAndMergeVerticesXYZ();
            const loops = chainContext.collectMaximalGrowableXYZArrays();
            PolygonOps_1.PolygonOps.orientLoopsCCWForOutwardNormalInPlace(loops, outwardNormal);
            const contour = SweepContour_1.SweepContour.createForPolygon(loops, outwardNormal);
            if (contour !== undefined) {
                contour.emitFacets(builder, insideClip);
            }
        }
        return builder.claimPolyface(true);
    }
    /** Clip each facet of polyface to the ClipPlane.
     * * Return all surviving clip as a new mesh.
     * * WARNING: The new mesh is "points only".
     */
    static clipPolyfaceClipPlane(polyface, clipper, insideClip = true) {
        return this.clipPolyfaceClipPlaneWithClosureFace(polyface, clipper, insideClip, false);
    }
    /** Clip each facet of polyface to the ClipPlane.
     * * Return surviving clip as a new mesh.
     * * WARNING: The new mesh is "points only".
     */
    static clipPolyfaceConvexClipPlaneSet(polyface, clipper) {
        const visitor = polyface.createVisitor(0);
        const builder = PolyfaceBuilder_1.PolyfaceBuilder.create();
        const work = new GrowableXYZArray_1.GrowableXYZArray(10);
        for (visitor.reset(); visitor.moveToNextFacet();) {
            clipper.clipConvexPolygonInPlace(visitor.point, work);
            if (visitor.point.length > 2)
                builder.addPolygonGrowableXYZArray(visitor.point);
        }
        return builder.claimPolyface(true);
    }
    /** Clip each facet of polyface to the ClipPlane or ConvexClipPlaneSet
     * * This method parses  the variant input types and calls a more specific method.
     * * WARNING: The new mesh is "points only".
     */
    static clipPolyface(polyface, clipper) {
        if (clipper instanceof ClipPlane_1.ClipPlane)
            return this.clipPolyfaceClipPlane(polyface, clipper);
        if (clipper instanceof ConvexClipPlaneSet_1.ConvexClipPlaneSet)
            return this.clipPolyfaceConvexClipPlaneSet(polyface, clipper);
        // (The if tests exhaust the type space -- this line is unreachable.)
        return undefined;
    }
    /** Find consecutive points around a polygon (with implied closure edge) that are ON a plane
     * @param points array of points around polygon.  Closure edge is implied.
     * @param chainContext context receiving edges
     * @param point0 work point
     * @param point1 work point
    */
    static collectEdgesOnPlane(points, clipper, chainContext, point0, point1) {
        const n = points.length;
        if (n > 1) {
            points.getPoint3dAtUncheckedPointIndex(n - 1, point0);
            for (let i = 0; i < n; i++) {
                points.getPoint3dAtUncheckedPointIndex(i, point1);
                if (clipper.isPointOn(point0) && clipper.isPointOn(point1))
                    chainContext.addSegment(point0, point1);
                point0.setFromPoint3d(point1);
            }
        }
    }
    /** Intersect each facet with the clip plane. (Producing intersection edges.)
     * * Return all edges  chained as array of LineString3d.
     */
    static sectionPolyfaceClipPlane(polyface, clipper) {
        const chainContext = ChainMerge_1.ChainMergeContext.create();
        const visitor = polyface.createVisitor(0);
        const work = new GrowableXYZArray_1.GrowableXYZArray(10);
        const point0 = Point3dVector3d_1.Point3d.create();
        const point1 = Point3dVector3d_1.Point3d.create();
        for (visitor.reset(); visitor.moveToNextFacet();) {
            clipper.clipConvexPolygonInPlace(visitor.point, work, true);
            this.collectEdgesOnPlane(visitor.point, clipper, chainContext, point0, point1);
        }
        chainContext.clusterAndMergeVerticesXYZ();
        return chainContext.collectMaximalChains();
    }
    /**
     * * Split facets of mesh "A" into parts that are
     *     * under mesh "B"
     *     * over mesh "B"
     * * both meshes are represented by visitors rather than the meshes themselves
     *     * If the data in-hand is a mesh, call with `mesh.createVisitor`
     * * The respective clip parts are fed to caller-supplied builders.
     *    * Caller may set either or both builders to toggle facet order (e.g. toggle the lower facets to make them "point down" in cut-fill application)
     *    * This step is commonly one-half of "cut fill".
     *       * A "cut fill" wrapper will call this twice with the visitor and builder roles reversed.
     * * Both polyfaces are assumed convex with CCW orientation viewed from above.
     * @param visitorA iterator over polyface to be split.
     * @param visitorB iterator over polyface that acts as a splitter
     * @param orientUnderMeshDownward if true, the "meshAUnderB" output is oriented with its normals reversed so it can act as the bottom side of a cut-fill pair.
     */
    static clipPolyfaceUnderOverConvexPolyfaceIntoBuilders(visitorA, visitorB, builderAUnderB, builderAOverB) {
        const rangeDataA = PolyfaceQuery_1.PolyfaceQuery.collectRangeLengthData(visitorA);
        const searchA = RangeSearch_1.RangeSearch.create2dSearcherForRangeLengthData(rangeDataA);
        if (!searchA)
            return;
        const range = Range_1.Range3d.create();
        for (visitorA.reset(); visitorA.moveToNextFacet();) {
            visitorA.point.setRange(range);
            searchA.addRange(range, visitorA.currentReadIndex());
        }
        const xyClip = new GrowableXYZArray_1.GrowableXYZArray(10);
        const workArray = new GrowableXYZArray_1.GrowableXYZArray(10);
        const xyFrustum = ConvexClipPlaneSet_1.ConvexClipPlaneSet.createEmpty();
        const below = new GrowableXYZArray_1.GrowableXYZArray(10);
        const above = new GrowableXYZArray_1.GrowableXYZArray(10);
        const planeOfFacet = ClipPlane_1.ClipPlane.createNormalAndPointXYZXYZ(0, 0, 1, 0, 0, 0);
        const altitudeRange = Range_1.Range1d.createNull();
        for (visitorB.reset(); visitorB.moveToNextFacet();) {
            visitorB.point.setRange(range);
            ConvexClipPlaneSet_1.ConvexClipPlaneSet.setPlaneAndXYLoopCCW(visitorB.point, planeOfFacet, xyFrustum);
            searchA.searchRange2d(range, (_rangeA, readIndexA) => {
                visitorA.moveToReadIndex(readIndexA);
                xyFrustum.polygonClip(visitorA.point, xyClip, workArray);
                // builderAOverB.addPolygonGrowableXYZArray(xyClip);
                if (xyClip.length > 0) {
                    // planeOfFacet.convexPolygonSplitInsideOutsideGrowableArrays(xyClip, below, above, altitudeRange);
                    PolygonOps_1.IndexedXYZCollectionPolygonOps.splitConvexPolygonInsideOutsidePlane(planeOfFacet, xyClip, below, above, altitudeRange);
                    if (below.length > 0 && builderAUnderB)
                        builderAUnderB.addPolygonGrowableXYZArray(below);
                    if (above.length > 0 && builderAOverB)
                        builderAOverB.addPolygonGrowableXYZArray(above);
                }
                return true;
            });
        }
    }
    /**
     * * Split facets into vertically overlapping sections
     * * both meshes are represented by visitors rather than the meshes themselves
     *     * If the data in-hand is a mesh, call with `mesh.createVisitor`
     * * The respective clip parts are returned as separate meshes.
     *    * Caller may set either or both builders to toggle facet order (e.g. toggle the lower facets to make them "point down" in cut-fill application)
     * * Both polyfaces are assumed convex with CCW orientation viewed from above.
     * * Each output contains some facets from meshA and some from meshB:
     *    * meshAUnderB -- areas where meshA is underneath mesh B.
     *        * If A is "design surface" and B is existing DTM, this is "cut" volume
     *    * meshAOverB  -- areas where meshB is over meshB.
     *        * If A is "design surface" and B is existing DTM, this is "fill" volume
     *
     * @param visitorA iterator over polyface to be split.
     * @param visitorB iterator over polyface that acts as a splitter
     * @param orientUnderMeshDownward if true, the "meshAUnderB" output is oriented with its normals reversed so it can act as the bottom side of a cut-fill pair.
     */
    static computeCutFill(meshA, meshB) {
        const visitorA = meshA.createVisitor();
        const visitorB = meshB.createVisitor();
        const builderAUnderB = PolyfaceBuilder_1.PolyfaceBuilder.create();
        const builderAOverB = PolyfaceBuilder_1.PolyfaceBuilder.create();
        builderAUnderB.toggleReversedFacetFlag();
        this.clipPolyfaceUnderOverConvexPolyfaceIntoBuilders(visitorA, visitorB, builderAUnderB, builderAOverB);
        builderAUnderB.toggleReversedFacetFlag();
        builderAOverB.toggleReversedFacetFlag();
        this.clipPolyfaceUnderOverConvexPolyfaceIntoBuilders(visitorB, visitorA, builderAOverB, builderAUnderB);
        return {
            meshAUnderB: builderAUnderB.claimPolyface(),
            meshAOverB: builderAOverB.claimPolyface(),
        };
    }
}
exports.PolyfaceClip = PolyfaceClip;
//# sourceMappingURL=PolyfaceClip.js.map