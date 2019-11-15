/** @module Curve */
import { PlaneAltitudeEvaluator } from "../Geometry";
import { StrokeOptions } from "./StrokeOptions";
import { Point3d } from "../geometry3d/Point3dVector3d";
import { Transform } from "../geometry3d/Transform";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { Ray3d } from "../geometry3d/Ray3d";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
import { IStrokeHandler } from "../geometry3d/GeometryHandler";
import { LineString3d } from "./LineString3d";
import { Clipper } from "../clipping/ClipUtils";
import { CurveLocationDetail } from "./CurveLocationDetail";
import { GeometryQuery } from "./GeometryQuery";
import { StrokeCountMap } from "../curve/Query/StrokeCountMap";
import { VariantCurveExtendParameter } from "./CurveExtendMode";
/** Describes the concrete type of a [[CurvePrimitive]]. Each type name maps to a specific subclass and can be used for type-switching in conditional statements.
 *  - "arc" => [[Arc3d]]
 *  - "lineSegment" => [[LineSegment3d]]
 *  - "lineString" => [[LineString3d]]
 *  - "bsplineCurve" => [[BSplineCurve3dBase]] which is an intermediate class implemented by [[BSplineCurve3d and BsplineCurve3dH]]
 *  - "bezierCurve" => [[BezierCurveBase]] which is an intermediate class implemented by [[BezierCurve3d and BezierCurve3dH]]
 *  - "transitionSpiral" => [[TransitionSpiral3d]]
 *  - "curveChainWithDistanceIndex" => [[CurveChainWithDistanceIndex]]
 *
 * @public
 */
export declare type CurvePrimitiveType = "arc" | "lineSegment" | "lineString" | "bsplineCurve" | "bezierCurve" | "transitionSpiral" | "curveChainWithDistanceIndex";
/** function signature for callback which announces a pair of numbers, such as a fractional interval, along with a containing CurvePrimitive.
 * @public
 */
export declare type AnnounceNumberNumberCurvePrimitive = (a0: number, a1: number, cp: CurvePrimitive) => void;
/** Function signature for a callback which announces a pair of numbers
 * @public
 */
export declare type AnnounceNumberNumber = (a0: number, a1: number) => void;
/** Function signature for a callback which announces a curve primitive
 * @public
 */
export declare type AnnounceCurvePrimitive = (cp: CurvePrimitive) => void;
/**
 * A curve primitive is bounded
 * A curve primitive maps fractions in 0..1 to points in space.
 * As the fraction proceeds from 0 towards 1, the point moves "forward" along the curve.
 * True distance along the curve is not always strictly proportional to fraction.
 * * LineSegment3d always has proportional fraction and distance
 * * an Arc3d which is true circular has proportional fraction and distance
 * *  A LineString3d is not proportional (except for special case of all segments of equal length)
 * * A Spiral3d is proportional
 * * A BsplineCurve3d is only proportional for special cases.
 *
 * For fractions outside 0..1, the curve primitive class may either (a) return the near endpoint or (b) evaluate an extended curve.
 * @public
 */
export declare abstract class CurvePrimitive extends GeometryQuery {
    /** String name for schema properties */
    readonly geometryCategory = "curvePrimitive";
    /** String name for schema properties */
    abstract readonly curvePrimitiveType: CurvePrimitiveType;
    protected constructor();
    /**
     * data attached during stroking for facets.
     */
    strokeData?: StrokeCountMap;
    /**
     * data attached in curve cutting.
     * @internal
     */
    startCut?: CurveLocationDetail;
    /**
     * data attached in curve cutting.
     * @internal
     */
    endCut?: CurveLocationDetail;
    /** Return the point (x,y,z) on the curve at fractional position.
     * @param fraction fractional position along the geometry.
     * @returns Returns a point on the curve.
     */
    abstract fractionToPoint(fraction: number, result?: Point3d): Point3d;
    /** Return the point (x,y,z) and derivative on the curve at fractional position.
     *
     * * Note that this derivative is "derivative of xyz with respect to fraction."
     * * this derivative shows the speed of the "fractional point" moving along the curve.
     * * this is not generally a unit vector.  use fractionToPointAndUnitTangent for a unit vector.
     * @param fraction fractional position along the geometry.
     * @returns Returns a ray whose origin is the curve point and direction is the derivative with respect to the fraction.
     */
    abstract fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /**
     * Returns a ray whose origin is the curve point and direction is the unit tangent.
     * @param fraction fractional position on the curve
     * @param result optional preallocated ray.
     */
    fractionToPointAndUnitTangent(fraction: number, result?: Ray3d): Ray3d;
    /** Return a plane with
     *
     * * origin at fractional position along the curve
     * * vectorU is the first derivative, i.e. tangent vector with length equal to the rate of change with respect to the fraction.
     * * vectorV is the second derivative, i.e.derivative of vectorU.
     */
    abstract fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors | undefined;
    /** Construct a frenet frame:
     * * origin at the point on the curve
     * * x axis is unit vector along the curve (tangent)
     * * y axis is perpendicular and in the plane of the osculating circle.
     * * z axis perpendicular to those.
     */
    fractionToFrenetFrame(fraction: number, result?: Transform): Transform | undefined;
    /**
     * Construct a point extrapolated along tangent at fraction.
     * @param fraction fractional position on the primitive
     * @param distance (signed) distance to move on the tangent.
     */
    fractionAndDistanceToPointOnTangent(fraction: number, distance: number): Point3d;
    /**
     * return the length of the curve.
     * * Curve length is always positive.
     */
    curveLength(): number;
    /**
     * Returns a (high accuracy) length of the curve between fractional positions
     * * Curve length is always positive.
     * * Default implementation applies a generic gaussian integration.
     * * Most curve classes (certainly LineSegment, LineString, Arc) are expected to provide efficient implementations.
     */
    curveLengthBetweenFractions(fraction0: number, fraction1: number): number;
    /**
     *
     * * Run an integration (with a default gaussian quadrature) with a fixed fractional step
     * * This is typically called by specific curve type implementations of curveLengthBetweenFractions.
     *   * For example, in Arc3d implementation of curveLengthBetweenFractions:
     *     * If the Arc3d is true circular, it the arc is true circular, use the direct `arcLength = radius * sweepRadians`
     *     * If the Arc3d is not true circular, call this method with an interval count appropriate to eccentricity and sweepRadians.
     * @returns Returns an integral estimated by numerical quadrature between the fractional positions.
     * @param fraction0 start fraction for integration
     * @param fraction1 end fraction for integration
     * @param numInterval number of quadrature intervals
     */
    curveLengthWithFixedIntervalCountQuadrature(fraction0: number, fraction1: number, numInterval: number, numGauss?: number): number;
    /**
     *
     * * (Attempt to) find a position on the curve at a signed distance from start fraction.
     * * Return the position as a CurveLocationDetail.
     * * In the `CurveLocationDetail`, record:
     *   * `fractional` position
     *   * `fraction` = coordinates of the point
     *   * `search
     *   * `a` = (signed!) distance moved.   If `allowExtension` is false and the move reached the start or end of the curve, this distance is smaller than the requested signedDistance.
     *   * `curveSearchStatus` indicates one of:
     *     * `error` (unusual) computation failed not supported for this curve.
     *     * `success` full movement completed
     *     * `stoppedAtBoundary` partial movement completed. This can be due to either
     *        * `allowExtension` parameter sent as `false`
     *        * the curve type (e.g. bspline) does not support extended range.
     * * if `allowExtension` is true, movement may still end at the startPoint or end point for curves that do not support extended geometry (specifically bsplines)
     * * if the curve returns a value (i.e. not `undefined`) for `curve.getFractionToDistanceScale()`, the base class carries out the computation
     *    and returns a final location.
     *   * LineSegment3d relies on this.
     * * If the curve does not implement the computation or the curve has zero length, the returned `CurveLocationDetail` has
     *    * `fraction` = the value of `startFraction`
     *    * `point` = result of `curve.fractionToPoint(startFraction)`
     *    * `a` = 0
     *    * `curveStartState` = `CurveSearchStatus.error`
     * @param startFraction fractional position where the move starts
     * @param signedDistance distance to move.   Negative distance is backwards in the fraction space
     * @param allowExtension if true, all the move to go beyond the startPoint or endpoint of the curve.  If false, do not allow movement beyond the startPoint or endpoint
     * @param result optional result.
     * @returns A CurveLocationDetail annotated as above.  Note that if the curve does not support the calculation, there is still a result which contains the point at the input startFraction, with failure indicated in the `curveStartState` member
     */
    moveSignedDistanceFromFraction(startFraction: number, signedDistance: number, allowExtension: boolean, result?: CurveLocationDetail): CurveLocationDetail;
    /**
     * Generic algorithm to search for point at signed distance from a fractional startPoint.
     * * This will work for well for smooth curves.
     * * Curves with tangent or other low-order-derivative discontinuities may need to implement specialized algorithms.
     * * We need to find an endFraction which is the end-of-interval (usually upper) limit of integration of the tangent magnitude from startFraction to endFraction
     * * That integral is a function of endFraction.
     * * The derivative of that integral with respect to end fraction is the tangent magnitude at end fraction.
     * * Use that function and (easily evaluated!) derivative for a Newton iteration
     * * TO ALL WHO HAVE FUZZY MEMORIES OF CALCULUS CLASS: "The derivative of the integral wrt upper limit is the value of the integrand there" is the
     *       fundamental theorem of integral calculus !!! The fundamental theorem is not just an abstraction !!! It is being used
     *       here in its barest possible form !!!
     * * See https://en.wikipedia.org/wiki/Fundamental_theorem_of_calculus
     * @param startFraction
     * @param signedDistance
     * @param _allowExtension
     * @param result
     */
    protected moveSignedDistanceFromFractionGeneric(startFraction: number, signedDistance: number, allowExtension: boolean, result?: CurveLocationDetail): CurveLocationDetail;
    /**
     * * Returns true if the curve's fraction queries extend beyond 0..1.
     * * Base class default implementation returns false.
     * * These class (and perhaps others in the future) will return true:
     *   * LineSegment3d
     *   * LineString3d
     *   * Arc3d
     */
    readonly isExtensibleFractionSpace: boolean;
    /**
     * Compute a length which may be an fast approximation to the true length.
     * This is expected to be either (a) exact or (b) larger than the actual length, but by no more than
     * a small multiple, perhaps up to PI/2, but commonly much closer to 1.
     *
     * * An example use of this is for setting a tolerance which is a small multiple of the curve length.
     * * Simple line, circular arc, and transition spiral may return exact length
     * * Ellipse may return circumference of some circle or polygon that encloses the ellipse.
     * * bspline curve may return control polygon length
     * *
     */
    abstract quickLength(): number;
    /** Search for the curve point that is closest to the spacePoint.
     *
     * * If the space point is exactly on the curve, this is the reverse of fractionToPoint.
     * * Since CurvePrimitive should always have start and end available as candidate points, this method should always succeed
     * @param spacePoint point in space
     * @param extend true to extend the curve (if possible), false for no extend, single CurveExtendOptions (for both directions), or array of distinct CurveExtendOptions for start and end.
     * @returns Returns a CurveLocationDetail structure that holds the details of the close point.
     */
    closestPoint(spacePoint: Point3d, extend: VariantCurveExtendParameter): CurveLocationDetail | undefined;
    /**
     * Find intervals of this curvePrimitive that are interior to a clipper
     * @param clipper clip structure (e.g. clip planes)
     * @param announce (optional) function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     * @returns true if any "in" segments are announced.
     */
    announceClipIntervals(_clipper: Clipper, _announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /** Return (if possible) a curve primitive which is a portion of this curve.
     * @param _fractionA [in] start fraction
     * @param _fractionB [in] end fraction
     */
    clonePartialCurve(_fractionA: number, _fractionB: number): CurvePrimitive | undefined;
    /**
     * * If the curve primitive has distance-along-curve strictly proportional to curve fraction, return true
     * * If distance-along-the-curve is not proportional, return undefined.
     * * When defined, the scale factor is always the length of the curve.
     * * This scale factor is typically available for these curve types:
     * * * All `LineSegment3d`
     * * * Arc3d which is a true circular arc (axes perpendicular and of equal length).
     * * * CurveChainWithDistanceIndex
     * * This scale factor is undefined for these curve types:
     * * * Arc3d which is a true ellipse, i.e. unequal lengths of defining vectors or non-perpendicular defining vectors.
     * * * bspline and bezier curves
     * @returns scale factor or undefined
     */
    getFractionToDistanceScale(): number | undefined;
    /** Reverse the curve's data so that its fractional stroking moves in the opposite direction. */
    abstract reverseInPlace(): void;
    /**
     * Compute intersections with a plane.
     * * The intersections are appended to the result array.
     * * The base class implementation emits strokes to an AppendPlaneIntersectionStrokeHandler object, which uses a Newton iteration to get
     *     high-accuracy intersection points within strokes.
     * * Derived classes should override this default implementation if there are easy analytic solutions.
     * * Derived classes are free to implement extended intersections (e.g. arc!!!)
     * @param plane The plane to be intersected.
     * @param result Array to receive intersections
     * @returns Return the number of CurveLocationDetail's added to the result array.
     */
    appendPlaneIntersectionPoints(plane: PlaneAltitudeEvaluator, result: CurveLocationDetail[]): number;
    /**
     * Examine contents of an array of CurveLocationDetail.
     * Filter the intersections according to the parameters.
     * @param allowExtend if false, remove points on the extension.
     * @param applySnappedCoordinates if true, change the stored fractions and coordinates to exact end values.  Otherwise
     *     use the exact values only for purpose of updating the curveIntervalRole.
     * @param startEndFractionTolerance if nonzero, adjust fraction to 0 or 1 with this tolerance.
     * @param startEndXYZTolerance if nonzero, adjust to endpoint with this tolerance.
     * @internal
     */
    static snapAndRestrictDetails(details: CurveLocationDetail[], allowExtend?: boolean, applySnappedCoordinates?: boolean, startEndFractionTolerance?: number, startEndXYZTolerance?: number): void;
    /** Ask if the curve is within tolerance of a plane.
     * @returns Returns true if the curve is completely within tolerance of the plane.
     */
    abstract isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /** return the startPoint of the primitive.  The default implementation returns fractionToPoint (0.0) */
    startPoint(result?: Point3d): Point3d;
    /** return the end point of the primitive. The default implementation returns fractionToPoint(1.0) */
    endPoint(result?: Point3d): Point3d;
    /** Add strokes to caller-supplied linestring */
    abstract emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** Ask the curve to announce points and simple subcurve fragments for stroking.
     * See IStrokeHandler for description of the sequence of the method calls.
     */
    abstract emitStrokableParts(dest: IStrokeHandler, options?: StrokeOptions): void;
    /**
     * return the stroke count required for given options.
     * * This returns a single number
     * * See computeComponentStrokeCountForOptions to get structured per-component counts and fraction mappings.
     * @param options StrokeOptions that determine count
     */
    abstract computeStrokeCountForOptions(options?: StrokeOptions): number;
    /**
     * attach StrokeCountMap structure to this primitive (and recursively to any children)
     * * Base class implementation (here) gets the simple count from computeStrokeCountForOptions and attaches it.
     * * LineString3d, arc3d, BezierCurve3d, BezierCurve3dH accept that default.
     * * Subdivided primitives (linestring, bspline curve) implement themselves and attach a StrokeCountMap containing the
     *       total count, and also containing an array of StrokeCountMap per component.
     * * For CurvePrimitiveWithDistanceIndex, the top level gets (only) a total count, and each child gets
     *       its own StrokeCountMap with appropriate structure.
     * @param options StrokeOptions that determine count
     * @param parentStrokeMap optional map from parent.  Its count, curveLength, and a1 values are increased with count and distance from this primitive.
     * @return sum of `a0+this.curveLength()`, for use as `a0` of successor in chain.
     */
    computeAndAttachRecursiveStrokeCounts(options?: StrokeOptions, parentMap?: StrokeCountMap): void;
    /**
     * * evaluate strokes at fractions indicated in a StrokeCountMap.
     *   * Base class implementation (here) gets the simple count from computeStrokeCountForOptions and strokes at uniform fractions.
     *   * LineString3d, arc3d, BezierCurve3d, BezierCurve3dH accept that default.
     *   * Subdivided primitives (linestring, bspline curve) implement themselves and evaluate within components.
     *   * CurvePrimitiveWithDistanceIndex recurses to its children.
     * * if packedFraction and packedDerivative arrays are present in the LineString3d, fill them.
     * @param map = stroke count data.
     * @param linestring = receiver linestring.
     * @return number of strokes added.  0 if any errors matching the map to the curve primitive.
     */
    addMappedStrokesToLineString3D(map: StrokeCountMap, linestring: LineString3d): number;
    /**
     * final install step to save curveMap in curve.  If parentMap is given, update its length, count, and a1 fields
     * @param curve curve to receive the annotation
     * @param map
     * @param parentMap
     */
    static installStrokeCountMap(curve: CurvePrimitive, curveMap: StrokeCountMap, parentMap?: StrokeCountMap): void;
}
//# sourceMappingURL=CurvePrimitive.d.ts.map