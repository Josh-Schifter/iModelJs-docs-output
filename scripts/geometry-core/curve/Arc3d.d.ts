/** @module Curve */
import { BeJSONFunctions, PlaneAltitudeEvaluator } from "../Geometry";
import { AngleSweep } from "../geometry3d/AngleSweep";
import { Angle } from "../geometry3d/Angle";
import { XYAndZ } from "../geometry3d/XYZProps";
import { Point3d, Vector3d } from "../geometry3d/Point3dVector3d";
import { Range3d } from "../geometry3d/Range";
import { Transform } from "../geometry3d/Transform";
import { Matrix3d } from "../geometry3d/Matrix3d";
import { Plane3dByOriginAndUnitNormal } from "../geometry3d/Plane3dByOriginAndUnitNormal";
import { Ray3d } from "../geometry3d/Ray3d";
import { Plane3dByOriginAndVectors } from "../geometry3d/Plane3dByOriginAndVectors";
import { GeometryHandler, IStrokeHandler } from "../geometry3d/GeometryHandler";
import { CurvePrimitive, AnnounceNumberNumberCurvePrimitive } from "./CurvePrimitive";
import { VariantCurveExtendParameter } from "./CurveExtendMode";
import { GeometryQuery } from "./GeometryQuery";
import { CurveLocationDetail } from "./CurveLocationDetail";
import { StrokeOptions } from "./StrokeOptions";
import { Clipper } from "../clipping/ClipUtils";
import { LineString3d } from "./LineString3d";
import { Matrix4d } from "../geometry4d/Matrix4d";
import { Point4d } from "../geometry4d/Point4d";
/**
 * Compact vector form of an elliptic arc defined by center, vectors for angle coordinates 0 and 90 degrees, and sweep.
 * * See `Arc3d` for further details of the parameterization and meaning of the vectors.
 * @public
 */
export interface ArcVectors {
    /** center point of arc. */
    center: Point3d;
    /** vector to point at angle 0 in parameter space */
    vector0: Vector3d;
    /** vector to point at angle 90 degrees in parameter space */
    vector90: Vector3d;
    /** angle swept by the subset of the complete arc. */
    sweep: AngleSweep;
}
/**
 * Circular or elliptic arc.
 *
 * * The angle to point equation is:
 *
 * **  `X = center + cos(theta) * vector0 + sin(theta) * vector90`
 * * When the two vectors are perpendicular and have equal length, it is a true circle.
 * * Non-perpendicular vectors are always elliptic.
 * *  vectors of unequal length are always elliptic.
 * * To create an ellipse in the common "major and minor axis" form of an ellipse:
 * ** vector0 is the vector from the center to the major axis extreme.
 * ** vector90 is the vector from the center to the minor axis extreme.
 * ** note the constructing the vectors to the extreme points makes them perpendicular.
 * *  The method toScaledMatrix3d () can be called to convert the unrestricted vector0,vector90 to perpendicular form.
 * * The unrestricted form is much easier to work with for common calculations -- stroking, projection to 2d, intersection with plane.
 * @public
 */
export declare class Arc3d extends CurvePrimitive implements BeJSONFunctions {
    /** String name for schema properties */
    readonly curvePrimitiveType = "arc";
    /**
     * Test if this and other are both instances of Arc3d.
     */
    isSameGeometryClass(other: GeometryQuery): boolean;
    private _center;
    private _matrix;
    private _sweep;
    private static _workPointA;
    private static _workPointB;
    /**
     * read property for (clone of) center
     */
    readonly center: Point3d;
    /**
     * read property for (clone of) vector0
     */
    readonly vector0: Vector3d;
    /**
     * read property for (clone of) vector90
     */
    readonly vector90: Vector3d;
    /**
     * read property for (clone of) plane normal, with arbitrary length.
     */
    readonly perpendicularVector: Vector3d;
    /**
     * read property for (clone of!) matrix of vector0, vector90, unit normal
     */
    readonly matrix: Matrix3d;
    /**
     * read property for (reference to !!) matrix of vector0, vector90, unit normal
     */
    readonly matrixRef: Matrix3d;
    /** property getter for the angle sweep */
    /** property setter for angle sweep */
    sweep: AngleSweep;
    /**
     * An Arc3d extends along its complete elliptic arc
     */
    readonly isExtensibleFractionSpace: boolean;
    private constructor();
    /**
     *  Return a clone of the arc, with transform applied
     * @param transform
     */
    cloneTransformed(transform: Transform): CurvePrimitive;
    /**
     * Redefine the arc with (captured references to) given data.
     * @param center arc center
     * @param matrix matrix with columns vector0, vector 90, and their unit cross product
     * @param sweep angle sweep
     */
    setRefs(center: Point3d, matrix: Matrix3d, sweep: AngleSweep): void;
    /**
     * Redefine the arc with (clones of) given data.
     * @param center arc center
     * @param matrix matrix with columns vector0, vector 90, and their unit cross product
     * @param sweep angle sweep
     */
    set(center: Point3d, matrix: Matrix3d, sweep: AngleSweep | undefined): void;
    /**
     * Copy center, matrix, and sweep from other Arc3d.
     */
    setFrom(other: Arc3d): void;
    /** Return a clone of this arc. */
    clone(): Arc3d;
    /**
     * Create an arc, capturing references to center, matrix and sweep.
     * @param center center point
     * @param matrix matrix with columns vector0, vector90, and unit cross product
     * @param sweep sweep limits
     * @param result optional preallocated result.
     */
    static createRefs(center: Point3d, matrix: Matrix3d, sweep: AngleSweep, result?: Arc3d): Arc3d;
    /**
     * Create an arc from center, x column to be scaled, and y column to be scaled.
     * @param center center of ellipse
     * @param matrix matrix whose x and y columns are unit vectors to be scaled by radius0 and radius90
     * @param radius0 radius in x direction.
     * @param radius90 radius in y direction.
     * @param sweep sweep limits
     * @param result optional preallocated result.
     */
    static createScaledXYColumns(center: Point3d, matrix: Matrix3d, radius0: number, radius90: number, sweep?: AngleSweep, result?: Arc3d): Arc3d;
    /**
     * Create a (full circular) arc from center, normal and radius
     * @param center center of ellipse
     * @param normal normal vector
     * @param radius radius in x direction.
     * @param result optional preallocated result.
     */
    static createCenterNormalRadius(center: Point3d, normal: Vector3d, radius: number, result?: Arc3d): Arc3d;
    /**
     * Creat an arc by center with vectors to points at 0 and 90 degrees in parameter space.
     * @param center arc center
     * @param vector0 vector to 0 degrees (commonly major axis)
     * @param vector90 vector to 90 degree point (commonly minor axis)
     * @param sweep sweep limits
     * @param result optional preallocated result
     */
    static create(center: Point3d, vector0: Vector3d, vector90: Vector3d, sweep?: AngleSweep, result?: Arc3d): Arc3d;
    /** Return a clone of this arc, projected to given z value.
     * * If `z` is omitted, the clone is at the z of the center.
     * * Note that projection to fixed z can change circle into ellipse (and (rarely) ellipse to circle)
     */
    cloneAtZ(z?: number): Arc3d;
    /**
     * Create an arc by center (cx,cy,xz) with vectors (ux,uy,uz) and (vx,vy,vz) to points at 0 and 90 degrees in parameter space.
     * @param result optional preallocated result
     */
    static createXYZXYZXYZ(cx: number, cy: number, cz: number, ux: number, uy: number, uz: number, vx: number, vy: number, vz: number, sweep?: AngleSweep, result?: Arc3d): Arc3d;
    /**
     * Return a quick estimate of the eccentricity of the ellipse.
     * * The estimator is the cross magnitude of the product of vectors U and V, divided by square of the larger magnitude
     * * for typical Arc3d with perpendicular UV, this is exactly the small axis divided by large.
     * * note that the eccentricity is AT MOST ONE.
     */
    quickEccentricity(): number;
    /** Create a circular arc defined by start point, any intermediate point, and end point.
     * If the points are colinear, assemble them into a linestring.
     */
    static createCircularStartMiddleEnd(pointA: XYAndZ, pointB: XYAndZ, pointC: XYAndZ, result?: Arc3d): Arc3d | LineString3d | undefined;
    /** The arc has simple proportional arc length if and only if it is a circular arc. */
    getFractionToDistanceScale(): number | undefined;
    /**
     * Convert a fractional position to xyz coordinates
     * @param fraction fractional position on arc
     * @param result optional preallocated result
     */
    fractionToPoint(fraction: number, result?: Point3d): Point3d;
    /**
     * Convert fractional arc and radial positions to xyz coordinates
     * @param fraction fractional position on arc
     * @param result optional preallocated result
     */
    fractionAndRadialFractionToPoint(arcFraction: number, radialFraction: number, result?: Point3d): Point3d;
    /**
     * Convert a fractional position to xyz coordinates and derivative with respect to fraction.
     * @param fraction fractional position on arc
     * @param result optional preallocated result
     */
    fractionToPointAndDerivative(fraction: number, result?: Ray3d): Ray3d;
    /** Construct a plane with
     * * origin at the fractional position along the arc
     * * x axis is the first derivative, i.e. tangent along the arc
     * * y axis is the second derivative, i.e. in the plane and on the center side of the tangent.
     * If the arc is circular, the second derivative is directly towards the center
     */
    fractionToPointAnd2Derivatives(fraction: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /**
     * Evaluate the point and derivative with respect to the angle (in radians)
     * @param radians angular position
     * @param result optional preallocated ray.
     */
    radiansToPointAndDerivative(radians: number, result?: Ray3d): Ray3d;
    /**
     * Return a parametric plane with
     * * origin at arc center
     * * vectorU from center to arc at angle (in radians)
     * * vectorV from center to arc at 90 degrees past the angle.
     * @param radians angular position
     * @param result optional preallocated plane
     */
    radiansToRotatedBasis(radians: number, result?: Plane3dByOriginAndVectors): Plane3dByOriginAndVectors;
    /**
     * Evaluate the point and derivative with respect to the angle (in radians)
     * @param theta angular position
     * @param result optional preallocated ray.
     */
    angleToPointAndDerivative(theta: Angle, result?: Ray3d): Ray3d;
    /**
     * Return the start point tof the arc.
     * @param result optional preallocated result
     */
    startPoint(result?: Point3d): Point3d;
    /**
     * Return the end point tof the arc.
     * @param result optional preallocated result
     */
    endPoint(result?: Point3d): Point3d;
    /** * If this is a circular arc, return the simple length derived from radius and sweep.
     * * Otherwise (i.e. if this elliptical) fall through to CurvePrimitive base implementation which
     *     Uses quadrature.
     */
    curveLength(): number;
    /** Gauss point quadrature count for evaluating curve length.   (The number of intervals is adjusted to the arc sweep) */
    static readonly quadratureGuassCount = 5;
    /** In quadrature for arc length, use this interval (divided by quickEccentricity) */
    static readonly quadratureIntervalAngleDegrees = 10;
    /** * If this is a circular arc, return the simple length derived from radius and sweep.
     * * Otherwise (i.e. if this elliptical) fall through CurvePrimitive integrator.
     */
    curveLengthBetweenFractions(fraction0: number, fraction1: number): number;
    /**
     * Return an approximate (but easy to compute) arc length.
     * The estimate is:
     * * Form 8 chords on full circle, proportionally fewer for partials.  (But 2 extras if less than half circle.)
     * * sum the chord lengths
     * * For a circle, we know this crude approximation has to be increased by a factor (theta/(2 sin (theta/2)))
     * * Apply that factor.
     * * Experiments confirm that this is within 3 percent for a variety of eccentricities and arc sweeps.
     */
    quickLength(): number;
    /**
     * * See extended comments on `CurvePrimitive.moveSignedDistanceFromFraction`
     * * A zero length line generates `CurveSearchStatus.error`
     * * Nonzero length line generates `CurveSearchStatus.success` or `CurveSearchStatus.stoppedAtBoundary`
     */
    moveSignedDistanceFromFraction(startFraction: number, signedDistance: number, allowExtension: false, result?: CurveLocationDetail): CurveLocationDetail;
    /**
     * Return all angles (in radians) where the ellipse tangent is perpendicular to the vector to a spacePoint.
     * @param spacePoint point of origin of vectors to the ellipse
     * @param _extend (NOT SUPPORTED -- ALWAYS ACTS AS "true")
     * @param _endpoints if true, force the end radians into the result.
     */
    allPerpendicularAngles(spacePoint: Point3d, _extend?: boolean, _endpoints?: boolean): number[];
    /**
     * Return details of the closest point on the arc, optionally extending to full ellipse.
     * @param spacePoint search for point closest to this point.
     * @param extend if true, consider projections to the complete ellipse.   If false, consider only endpoints and projections within the arc sweep.
     * @param result optional preallocated result.
     */
    closestPoint(spacePoint: Point3d, extend: VariantCurveExtendParameter, result?: CurveLocationDetail): CurveLocationDetail;
    /** Reverse the sweep  of the arc. */
    reverseInPlace(): void;
    /** apply a transform to the arc basis vectors.
     * * nonuniform (i.e. skewing) transforms are allowed.
     * * The transformed vector0 and vector90 are NOT squared up as major minor axes.  (This is a good feature!!)
     */
    tryTransformInPlace(transform: Transform): boolean;
    /**
     * Return true if the ellipse center and basis vectors are in the plane
     * @param plane
     */
    isInPlane(plane: Plane3dByOriginAndUnitNormal): boolean;
    /**
     * Return true if the vector0 and vector90 are of equal length and perpendicular.
     */
    readonly isCircular: boolean;
    /** If the arc is circular, return its radius.  Otherwise return undefined */
    circularRadius(): number | undefined;
    /** Return the larger of the two defining vectors. */
    maxVectorLength(): number;
    /**
     * compute intersections with a plane.
     * @param plane plane to intersect
     * @param result array of locations on the curve.
     */
    appendPlaneIntersectionPoints(plane: PlaneAltitudeEvaluator, result: CurveLocationDetail[]): number;
    /**
     * Extend a range to include the range of the arc.
     * @param range range being extended.
     * @param transform optional transform to apply to the arc.
     */
    extendRange(range: Range3d, transform?: Transform): void;
    /**
     * Create a new arc which is a unit circle centered at the origin.
     */
    static createUnitCircle(): Arc3d;
    /**
     * Create a new arc which is parallel to the xy plane, with given center and radius and optional angle sweep.
     * @param center center of arc
     * @param radius radius of arc
     * @param sweep sweep limits.  defaults to full circle.
     */
    static createXY(center: Point3d, radius: number, sweep?: AngleSweep): Arc3d;
    /**
     * Create a new arc which is parallel to the xy plane, with given center and x,y radii, and optional angle sweep
     * @param center center of ellipse
     * @param radiusA x axis radius
     * @param radiusB y axis radius
     * @param sweep angle sweep
     */
    static createXYEllipse(center: Point3d, radiusA: number, radiusB: number, sweep?: AngleSweep): Arc3d;
    /**
     * Replace the arc's 0 and 90 degree vectors.
     * @param vector0 vector from center to ellipse point at 0 degrees in parameter space
     * @param vector90 vector from center to ellipse point at 90 degrees in parameter space
     */
    setVector0Vector90(vector0: Vector3d, vector90: Vector3d): void;
    /** Return the arc definition with rigid matrix form with axis radii.
     */
    toScaledMatrix3d(): {
        center: Point3d;
        axes: Matrix3d;
        r0: number;
        r90: number;
        sweep: AngleSweep;
    };
    /** Return the arc definition with center, two vectors, and angle sweep;
     */
    toVectors(): ArcVectors;
    /** Return the arc definition with center, two vectors, and angle sweep, optionally transformed.
     */
    toTransformedVectors(transform?: Transform): {
        center: Point3d;
        vector0: Vector3d;
        vector90: Vector3d;
        sweep: AngleSweep;
    };
    /** Return the arc definition with center, two vectors, and angle sweep, transformed to 4d points.
     */
    toTransformedPoint4d(matrix: Matrix4d): {
        center: Point4d;
        vector0: Point4d;
        vector90: Point4d;
        sweep: AngleSweep;
    };
    /**
     * Set this arc from a json object with these values:
     * * center center point
     * * vector0 vector from center to 0 degree point in parameter space (commonly but not always the major axis vector)
     * * vector90 vector from center to 90 degree point in parameter space (commonly but not always the minor axis vector)
     * @param json
     */
    setFromJSON(json?: any): void;
    /**
     * Convert to a JSON object.
     * @return {*} [center:  [], vector0:[], vector90:[], sweep []}
     */
    toJSON(): any;
    /**
     * Test if this arc is almost equal to another GeometryQuery object
     */
    isAlmostEqual(otherGeometry: GeometryQuery): boolean;
    /** Emit strokes to caller-supplied linestring */
    emitStrokes(dest: LineString3d, options?: StrokeOptions): void;
    /** Emit strokes to caller-supplied handler */
    emitStrokableParts(handler: IStrokeHandler, options?: StrokeOptions): void;
    /**
     * return the stroke count required for given options.
     * @param options StrokeOptions that determine count
     */
    computeStrokeCountForOptions(options?: StrokeOptions): number;
    /** Second step of double dispatch:  call `handler.handleArc3d(this)` */
    dispatchToGeometryHandler(handler: GeometryHandler): any;
    /** Return (if possible) an arc which is a portion of this curve.
     * @param fractionA [in] start fraction
     * @param fractionB [in] end fraction
     */
    clonePartialCurve(fractionA: number, fractionB: number): CurvePrimitive | undefined;
    /** Return an arc whose basis vectors are rotated by given angle within the current basis space.
     * * the result arc will have its zero-degree point (new `vector0`) at the current `vector0 * cos(theta) + vector90 * sin(theta)`
     * * the result sweep is adjusted so all fractional coordinates (e.g. start and end) evaluate to the same xyz.
     *   * Specifically, theta is subtracted from the original start and end angles.
     * @param theta the angle (in the input arc space) which is to become the 0-degree point in the new arc.
     */
    cloneInRotatedBasis(theta: Angle): Arc3d;
    /**
     * Find intervals of this CurvePrimitive that are interior to a clipper
     * @param clipper clip structure (e.g.clip planes)
     * @param announce(optional) function to be called announcing fractional intervals"  ` announce(fraction0, fraction1, curvePrimitive)`
     * @returns true if any "in" segments are announced.
     */
    announceClipIntervals(clipper: Clipper, announce?: AnnounceNumberNumberCurvePrimitive): boolean;
    /** Compute the center and vectors of another arc as local coordinates within this arc's frame. */
    otherArcAsLocalVectors(other: Arc3d): ArcVectors | undefined;
    /**
     * Determine an arc "at a point of inflection" of a point sequence.
     * * Return the arc along with the fractional positions of the tangency points.
     * * In the returned object:
     *   * `arc` is the (bounded) arc
     *   * `fraction10` is the tangency point's position as an interpolating fraction of the line segment from `point1` (backwards) to `point0`
     *   * `fraction12` is the tangency point's position as an interpolating fraction of the line segment from `point1` (forward) to `point2`
     *   * `point1` is the `point1` input.
     * * If unable to construct the arc:
     *   * `point` is the `point` input.
     *   * both fractions are zero
     *   * `arc` is undefined.
     * @param point0 first point of path. (the point before the point of inflection)
     * @param point1 second point of path (the point of inflection)
     * @param point2 third point of path (the point after the point of inflection)
     * @param radius arc radius
     *
     */
    static createFilletArc(point0: Point3d, point1: Point3d, point2: Point3d, radius: number): ArcBlendData;
}
/**
 * Carrier structure for an arc with fractional data on incoming, outgoing curves.
 * @public
 */
export interface ArcBlendData {
    /** Constructed arc */
    arc?: Arc3d;
    /** fraction "moving backward" on the inbound curve */
    fraction10: number;
    /** fraction "moving forward" on the outbound curve */
    fraction12: number;
    /** optional reference point */
    point?: Point3d;
}
//# sourceMappingURL=Arc3d.d.ts.map