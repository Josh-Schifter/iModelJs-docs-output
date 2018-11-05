"use strict";
/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module CartesianGeometry */
const Geometry_1 = require("./Geometry");
const AnalyticGeometry_1 = require("./AnalyticGeometry");
const Transform_1 = require("./Transform");
/** Minimal object containing x,y and operations that are meaningful without change in both point and vector. */
class XY {
    /** Set both x and y. */
    set(x = 0, y = 0) { this.x = x; this.y = y; }
    /** Set both x and y to zero */
    setZero() { this.x = 0; this.y = 0; }
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    /** Set both x and y from other. */
    setFrom(other) {
        if (other) {
            this.x = other.x;
            this.y = other.y;
        }
        else {
            this.x = 0;
            this.y = 0;
        }
    }
    /** Returns true if this and other have equal x,y parts within Geometry.smallMetricDistance. */
    isAlmostEqual(other, tol) { return Geometry_1.Geometry.isSameCoordinate(this.x, other.x, tol) && Geometry_1.Geometry.isSameCoordinate(this.y, other.y, tol); }
    /** return a json array or object with the [x,y] data.  */
    toJSON() { return [this.x, this.y]; }
    toJSONXY() { return { x: this.x, y: this.y }; }
    /** Set x and y from a JSON source */
    setFromJSON(json) {
        if (Array.isArray(json)) {
            this.set(json[0] || 0, json[1] || 0);
            return;
        }
        if (json) {
            this.set(json.x || 0, json.y || 0);
            return;
        }
        this.set(0, 0);
    }
    /** Return the distance from this point to other */
    distance(other) {
        const xDist = other.x - this.x;
        const yDist = other.y - this.y;
        return (Math.sqrt(xDist * xDist + yDist * yDist));
    }
    /** Return squared distance from this point to other */
    distanceSquared(other) {
        const xDist = other.x - this.x;
        const yDist = other.y - this.y;
        return (xDist * xDist + yDist * yDist);
    }
    /** Return the largest absolute distance between corresponding components */
    maxDiff(other) {
        return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
    }
    /** @returns true if the x,y components are both small by metric metric tolerance */
    get isAlmostZero() {
        return Geometry_1.Geometry.isSmallMetricDistance(this.x) && Geometry_1.Geometry.isSmallMetricDistance(this.y);
    }
    /** Return the largest absolute value of any component */
    maxAbs() { return Math.max(Math.abs(this.x), Math.abs(this.y)); }
    /** Return the magnitude of the vector */
    magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    /** Return the squared magnitude of the vector.  */
    magnitudeSquared() { return this.x * this.x + this.y * this.y; }
    /** @returns true if the x,y components are exactly equal. */
    isExactEqual(other) { return this.x === other.x && this.y === other.y; }
    isAlmostEqualMetric(other) { return this.maxDiff(other) <= Geometry_1.Geometry.smallMetricDistance; }
    /** Return a (full length) vector from this point to other */
    vectorTo(other, result) {
        return Vector2d.create(other.x - this.x, other.y - this.y, result);
    }
    /** Return a unit vector from this point to other */
    unitVectorTo(target, result) {
        return this.vectorTo(target, result).normalize(result);
    }
}
exports.XY = XY;
/** Minimal object containing x,y,z and operations that are meaningful without change in both point and vector. */
class XYZ {
    /**
     * Set the x,y,z  parts.
     * @param x (optional) x part
     * @param y (optional) y part
     * @param z (optional) z part
     */
    set(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    /** Set the x,y,z parts to zero. */
    setZero() { this.x = 0; this.y = 0; this.z = 0; }
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    /** Type guard for XAndY.
     * @note this will return true for an XYAndZ. If you wish to distinguish between the two, call isXYAndZ first.
     */
    static isXAndY(arg) { return arg.x !== undefined && arg.y !== undefined; }
    /** Type guard to determine whether an object has a member called "z" */
    static hasZ(arg) { return arg.z !== undefined; }
    /** Type guard for XYAndZ.  */
    static isXYAndZ(arg) { return this.isXAndY(arg) && this.hasZ(arg); }
    /**
     * Set the x,y,z parts from one of these input types
     *
     * * XYZ -- copy the x,y,z parts
     * * Float64Array -- Copy from indices 0,1,2 to x,y,z
     * * XY -- copy the x, y parts and set z=0
     */
    setFrom(other) {
        if (XYZ.isXAndY(other)) {
            this.x = other.x;
            this.y = other.y;
            this.z = XYZ.hasZ(other) ? other.z : 0;
        }
        else {
            this.x = other[0];
            this.y = other[1];
            this.z = other[2];
        }
    }
    /**
     * Set the x,y,z parts from a Point3d.
     * This is the same effect as `setFrom(other)` with no pretesting of variant input type
     */
    setFromPoint3d(other) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
    }
    /** Returns true if this and other have equal x,y,z parts within Geometry.smallMetricDistance.
     * @param other The other XYAndZ to compare
     * @param tol The tolerance for the comparison. If undefined, use [[Geometry.smallMetricDistance]]
     */
    isAlmostEqual(other, tol) {
        return Geometry_1.Geometry.isSameCoordinate(this.x, other.x, tol)
            && Geometry_1.Geometry.isSameCoordinate(this.y, other.y, tol)
            && Geometry_1.Geometry.isSameCoordinate(this.z, other.z, tol);
    }
    /** Return true if this and other have equal x,y,z parts within Geometry.smallMetricDistance. */
    isAlmostEqualXYZ(x, y, z, tol) {
        return Geometry_1.Geometry.isSameCoordinate(this.x, x, tol)
            && Geometry_1.Geometry.isSameCoordinate(this.y, y, tol)
            && Geometry_1.Geometry.isSameCoordinate(this.z, z, tol);
    }
    /** Return true if this and other have equal x,y parts within Geometry.smallMetricDistance. */
    isAlmostEqualXY(other, tol) {
        return Geometry_1.Geometry.isSameCoordinate(this.x, other.x, tol)
            && Geometry_1.Geometry.isSameCoordinate(this.y, other.y, tol);
    }
    /** Return a JSON object as array [x,y,z] */
    toJSON() { return [this.x, this.y, this.z]; }
    toJSONXYZ() { return { x: this.x, y: this.y, z: this.z }; }
    /** Pack the x,y,z values in a Float64Array. */
    toFloat64Array() { return Float64Array.of(this.x, this.y, this.z); }
    /**
     * Set the x,y,z properties from one of several json forms:
     *
     * *  array of numbers: [x,y,z]
     * *  object with x,y, and (optional) z as numeric properties {x: xValue, y: yValue, z: zValue}
     */
    setFromJSON(json) {
        if (Array.isArray(json)) {
            this.set(json[0] || 0, json[1] || 0, json[2] || 0);
            return;
        }
        if (json) {
            this.set(json.x || 0, json.y || 0, json.z || 0);
            return;
        }
        this.set(0, 0, 0);
    }
    /** Return the distance from this point to other */
    distance(other) {
        const xDist = other.x - this.x;
        const yDist = other.y - this.y;
        const zDist = other.z - this.z;
        return (Math.sqrt(xDist * xDist + yDist * yDist + zDist * zDist));
    }
    /** Return squared distance from this point to other */
    distanceSquared(other) {
        const xDist = other.x - this.x;
        const yDist = other.y - this.y;
        const zDist = other.z - this.z;
        return (xDist * xDist + yDist * yDist + zDist * zDist);
    }
    /** Return the XY distance from this point to other */
    distanceXY(other) {
        const xDist = other.x - this.x;
        const yDist = other.y - this.y;
        return (Math.sqrt(xDist * xDist + yDist * yDist));
    }
    /** Return squared XY distance from this point to other */
    distanceSquaredXY(other) {
        const xDist = other.x - this.x;
        const yDist = other.y - this.y;
        return (xDist * xDist + yDist * yDist);
    }
    /** Return the largest absolute distance between corresponding components */
    maxDiff(other) {
        return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y), Math.abs(this.z - other.z));
    }
    /**
     * Return the x,y, z component corresponding to 0,1,2.
     */
    at(index) { if (index < 0.5)
        return this.x; if (index > 1.5)
        return this.z; return this.y; }
    /** Return the index (0,1,2) of the x,y,z component with largest absolute value */
    indexOfMaxAbs() {
        let index = 0;
        let a = Math.abs(this.x);
        let b = Math.abs(this.y);
        if (b > a) {
            index = 1;
            a = b;
        }
        b = Math.abs(this.z);
        if (b > a) {
            index = 2;
            a = b;
        }
        return index;
    }
    /** Return true if the if x,y,z components are all nearly zero to tolerance Geometry.smallMetricDistance */
    get isAlmostZero() {
        return Geometry_1.Geometry.isSmallMetricDistance(this.x) && Geometry_1.Geometry.isSmallMetricDistance(this.y) && Geometry_1.Geometry.isSmallMetricDistance(this.z);
    }
    /** Return the largest absolute value of any component */
    maxAbs() { return Math.max(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z)); }
    /** Return the sqrt of the sum of squared x,y,z parts */
    magnitude() { return Math.hypot(this.x, this.y, this.z); }
    /** Return the sum of squared x,y,z parts */
    magnitudeSquared() { return this.x * this.x + this.y * this.y + this.z * this.z; }
    /** Return sqrt of the sum of squared x,y parts */
    magnitudeXY() { return Math.hypot(this.x, this.y); }
    /** Return the sum of squared x,y parts */
    magnitudeSquaredXY() { return this.x * this.x + this.y * this.y; }
    /** exact equality test. */
    isExactEqual(other) { return this.x === other.x && this.y === other.y && this.z === other.z; }
    /** equality test with Geometry.smallMetricDistance tolerance */
    isAlmostEqualMetric(other) { return this.maxDiff(other) <= Geometry_1.Geometry.smallMetricDistance; }
    /** add x,y,z from other in place. */
    addInPlace(other) { this.x += other.x; this.y += other.y; this.z += other.z; }
    /** add (in place) the scaled x,y,z of other */
    addScaledInPlace(other, scale) {
        this.x += scale * other.x;
        this.y += scale * other.y;
        this.z += scale * other.z;
    }
    /** Multiply the x, y, z parts by scale. */
    scaleInPlace(scale) { this.x *= scale; this.y *= scale; this.z *= scale; }
    /** Clone strongly typed as Point3d */
    cloneAsPoint3d() { return Point3d.create(this.x, this.y, this.z); }
    /** Return a (full length) vector from this point to other */
    vectorTo(other, result) {
        return Vector3d.create(other.x - this.x, other.y - this.y, other.z - this.z, result);
    }
    /** Return a multiple of a the (full length) vector from this point to other */
    scaledVectorTo(other, scale, result) {
        return Vector3d.create(scale * (other.x - this.x), scale * (other.y - this.y), scale * (other.z - this.z), result);
    }
    /** Return a unit vector from this vector to other. Return a 000 vector if the input is too small to normalize.
     * @param other target of created vector.
     * @param result optional result vector.
     */
    unitVectorTo(target, result) { return this.vectorTo(target, result).normalize(result); }
    /** Freeze this XYZ */
    freeze() { Object.freeze(this); }
}
exports.XYZ = XYZ;
class Point3d extends XYZ {
    /** Constructor for Point3d */
    constructor(x = 0, y = 0, z = 0) { super(x, y, z); }
    static fromJSON(json) { const val = new Point3d(); val.setFromJSON(json); return val; }
    /** Return a new Point3d with the same coordinates */
    clone() { return new Point3d(this.x, this.y, this.z); }
    /** Create a new Point3d with given coordinates
     * @param x x part
     * @param y y part
     * @param z z part
     */
    static create(x = 0, y = 0, z = 0, result) {
        if (result) {
            result.x = x;
            result.y = y;
            result.z = z;
            return result;
        }
        return new Point3d(x, y, z);
    }
    /** Copy contents from another Point3d, Point2d, Vector2d, or Vector3d */
    static createFrom(data, result) {
        if (data instanceof Float64Array) {
            if (data.length >= 3)
                return Point3d.create(data[0], data[1], data[2], result);
            if (data.length >= 2)
                return Point3d.create(data[0], data[1], 0, result);
            if (data.length >= 1)
                return Point3d.create(data[0], 0, 0, result);
            return Point3d.create(0, 0, 0, result);
        }
        return Point3d.create(data.x, data.y, XYZ.hasZ(data) ? data.z : 0, result);
    }
    /**
     * Copy x,y,z from
     * @param xyzData flat array of xyzxyz for multiple points
     * @param pointIndex index of point to extract.   This index is multiplied by 3 to obtain starting index in the array.
     * @param result optional result point.
     */
    static createFromPacked(xyzData, pointIndex, result) {
        const indexX = pointIndex * 3;
        if (indexX >= 0 && indexX + 2 < xyzData.length)
            return Point3d.create(xyzData[indexX], xyzData[indexX + 1], xyzData[indexX + 2], result);
        return undefined;
    }
    /**
     * Copy and unweight xyzw.
     * @param xyzData flat array of xyzwxyzw for multiple points
     * @param pointIndex index of point to extract.   This index is multiplied by 4 to obtain starting index in the array.
     * @param result optional result point.
     */
    static createFromPackedXYZW(xyzData, pointIndex, result) {
        const indexX = pointIndex * 4;
        if (indexX >= 0 && indexX + 3 < xyzData.length) {
            const w = xyzData[indexX + 3];
            if (!Geometry_1.Geometry.isSmallMetricDistance(w)) {
                const divW = 1.0 / w;
                return Point3d.create(divW * xyzData[indexX], divW * xyzData[indexX + 1], divW * xyzData[indexX + 2], result);
            }
        }
        return undefined;
    }
    /** Create a new point with 000 xyz */
    static createZero(result) { return Point3d.create(0, 0, 0, result); }
    /** Return the cross product of the vectors from this to pointA and pointB
     *
     * *  the result is a vector
     * *  the result is perpendicular to both vectors, with right hand orientation
     * *  the magnitude of the vector is twice the area of the triangle.
     */
    crossProductToPoints(pointA, pointB, result) {
        return Vector3d.createCrossProduct(pointA.x - this.x, pointA.y - this.y, pointA.z - this.z, pointB.x - this.x, pointB.y - this.y, pointB.z - this.z, result);
    }
    /** Return the triple product of the vectors from this to pointA, pointB, pointC
     *
     * * This is a scalar (number)
     * *  This is 6 times the (signed) volume of the tetrahedron on the 4 points.
     */
    tripleProductToPoints(pointA, pointB, pointC) {
        return Geometry_1.Geometry.tripleProduct(pointA.x - this.x, pointA.y - this.y, pointA.z - this.z, pointB.x - this.x, pointB.y - this.y, pointB.z - this.z, pointC.x - this.x, pointC.y - this.y, pointC.z - this.z);
    }
    /** Return the cross product of the vectors from this to pointA and pointB
     *
     * *  the result is a scalar
     * *  the magnitude of the vector is twice the signed area of the triangle.
     * *  this is positive for counter-clockwise order of the points, negative for clockwise.
     */
    crossProductToPointsXY(pointA, pointB) {
        return Geometry_1.Geometry.crossProductXYXY(pointA.x - this.x, pointA.y - this.y, pointB.x - this.x, pointB.y - this.y);
    }
    /** Return a point interpolated between this point and the right param. */
    interpolate(fraction, other, result) {
        if (fraction <= 0.5)
            return Point3d.create(this.x + fraction * (other.x - this.x), this.y + fraction * (other.y - this.y), this.z + fraction * (other.z - this.z), result);
        const t = fraction - 1.0;
        return Point3d.create(other.x + t * (other.x - this.x), other.y + t * (other.y - this.y), other.z + t * (other.z - this.z), result);
    }
    /**
     * Return a ray whose ray.origin is interpolated, and ray.direction is the vector between points with a
     * scale factor applied.
     * @param fraction fractional position between points.
     * @param other endpoint of interpolation
     * @param tangentScale scale factor to apply to the startToEnd vector
     * @param result  optional receiver.
     */
    interpolatePointAndTangent(fraction, other, tangentScale, result) {
        result = result ? result : AnalyticGeometry_1.Ray3d.createZero();
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const dz = other.z - this.z;
        result.direction.set(tangentScale * dx, tangentScale * dy, tangentScale * dz);
        if (fraction <= 0.5)
            result.origin.set(this.x + fraction * dx, this.y + fraction * dy, this.z + fraction * dz);
        else {
            const t = fraction - 1.0;
            result.origin.set(other.x + t * dx, other.y + t * dy, other.z + t * dz);
        }
        return result;
    }
    /** Return a point with independent x,y,z fractional interpolation. */
    interpolateXYZ(fractionX, fractionY, fractionZ, other, result) {
        return Point3d.create(Geometry_1.Geometry.interpolate(this.x, fractionX, other.x), Geometry_1.Geometry.interpolate(this.y, fractionY, other.y), Geometry_1.Geometry.interpolate(this.z, fractionZ, other.z), result);
    }
    /** Interpolate between points, then add a shift in the xy plane by a fraction of the XY projection perpendicular. */
    interpolatePerpendicularXY(fraction, pointB, fractionXYPerp, result) {
        result = result ? result : new Point3d();
        const vector = pointB.minus(this);
        this.interpolate(fraction, pointB, result);
        result.x -= fractionXYPerp * vector.y;
        result.y += fractionXYPerp * vector.x;
        return result;
    }
    /** Return point minus vector */
    minus(vector, result) {
        return Point3d.create(this.x - vector.x, this.y - vector.y, this.z - vector.z, result);
    }
    /** Return point plus vector */
    plus(vector, result) {
        return Point3d.create(this.x + vector.x, this.y + vector.y, this.z + vector.z, result);
    }
    /** Return point plus vector */
    plusXYZ(dx = 0, dy = 0, dz = 0, result) {
        return Point3d.create(this.x + dx, this.y + dy, this.z + dz, result);
    }
    /** Return point + vector * scalar */
    plusScaled(vector, scaleFactor, result) {
        return Point3d.create(this.x + vector.x * scaleFactor, this.y + vector.y * scaleFactor, this.z + vector.z * scaleFactor, result);
    }
    /** Return point + vectorA * scalarA + vectorB * scalarB */
    plus2Scaled(vectorA, scalarA, vectorB, scalarB, result) {
        return Point3d.create(this.x + vectorA.x * scalarA + vectorB.x * scalarB, this.y + vectorA.y * scalarA + vectorB.y * scalarB, this.z + vectorA.z * scalarA + vectorB.z * scalarB, result);
    }
    /** Return point + vectorA * scalarA + vectorB * scalarB + vectorC * scalarC */
    plus3Scaled(vectorA, scalarA, vectorB, scalarB, vectorC, scalarC, result) {
        return Point3d.create(this.x + vectorA.x * scalarA + vectorB.x * scalarB + vectorC.x * scalarC, this.y + vectorA.y * scalarA + vectorB.y * scalarB + vectorC.y * scalarC, this.z + vectorA.z * scalarA + vectorB.z * scalarB + vectorC.z * scalarC, result);
    }
    /**
     * Return a point that is scaled from the source point.
     * @param source existing point
     * @param scale scale factor to apply to its x,y,z parts
     * @param result optional point to receive coordinates
     */
    static createScale(source, scale, result) {
        return Point3d.create(source.x * scale, source.y * scale, source.z * scale, result);
    }
    /** create a point that is a linear combination (weighted sum) of 2 input points.
     * @param pointA first input point
     * @param scaleA scale factor for pointA
     * @param pointB second input point
     * @param scaleB scale factor for pointB
     */
    static createAdd2Scaled(pointA, scaleA, pointB, scaleB, result) {
        return Point3d.create(pointA.x * scaleA + pointB.x * scaleB, pointA.y * scaleA + pointB.y * scaleB, pointA.z * scaleA + pointB.z * scaleB, result);
    }
    /** Create a point that is a linear combination (weighted sum) of 3 input points.
     * @param pointA first input point
     * @param scaleA scale factor for pointA
     * @param pointB second input point
     * @param scaleB scale factor for pointB
     * @param pointC third input point.
     * @param scaleC scale factor for pointC
     */
    static createAdd3Scaled(pointA, scaleA, pointB, scaleB, pointC, scaleC, result) {
        return Point3d.create(pointA.x * scaleA + pointB.x * scaleB + pointC.x * scaleC, pointA.y * scaleA + pointB.y * scaleB + pointC.y * scaleC, pointA.z * scaleA + pointB.z * scaleB + pointC.z * scaleC, result);
    }
    /**
     * Return the dot product of vectors from this to pointA and this to pointB.
     * @param targetA target point for first vector
     * @param targetB target point for second vector
     */
    dotVectorsToTargets(targetA, targetB) {
        return (targetA.x - this.x) * (targetB.x - this.x) +
            (targetA.y - this.y) * (targetB.y - this.y) +
            (targetA.z - this.z) * (targetB.z - this.z);
    }
    /** Return the fractional projection of this onto a line between points.
     *
     */
    fractionOfProjectionToLine(startPoint, endPoint, defaultFraction = 0) {
        const denominator = startPoint.distanceSquared(endPoint);
        if (denominator < Geometry_1.Geometry.smallMetricDistanceSquared)
            return defaultFraction;
        return startPoint.dotVectorsToTargets(endPoint, this) / denominator;
    }
}
exports.Point3d = Point3d;
/** 3D vector with x,y,z properties */
class Vector3d extends XYZ {
    constructor(x = 0, y = 0, z = 0) { super(x, y, z); }
    clone() { return new Vector3d(this.x, this.y, this.z); }
    static create(x = 0, y = 0, z = 0, result) {
        if (result) {
            result.x = x;
            result.y = y;
            result.z = z;
            return result;
        }
        return new Vector3d(x, y, z);
    }
    /**
     * Create a vector which is cross product of two vectors supplied as separate arguments
     * @param ux x coordinate of vector u
     * @param uy y coordinate of vector u
     * @param uz z coordinate of vector u
     * @param vx x coordinate of vector v
     * @param vy y coordinate of vector v
     * @param vz z coordinate of vector v
     * @param result optional result vector.
     */
    static createCrossProduct(ux, uy, uz, vx, vy, vz, result) {
        return Vector3d.create(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx, result);
    }
    /**
     * Accumulate a vector which is cross product vectors from origin (ax,ay,az) to targets (bx,by,bz) and (cx,cy,cz)
     * @param ax x coordinate of origin
     * @param ay y coordinate of origin
     * @param az z coordinate of origin
     * @param bx x coordinate of target point b
     * @param by y coordinate of target point b
     * @param bz z coordinate of target point b
     * @param cx x coordinate of target point c
     * @param cy y coordinate of target point c
     * @param cz z coordinate of target point c
     */
    addCrossProductToTargetsInPlace(ax, ay, az, bx, by, bz, cx, cy, cz) {
        const ux = bx - ax;
        const uy = by - ay;
        const uz = bz - az;
        const vx = cx - ax;
        const vy = cy - ay;
        const vz = cz - az;
        this.x += uy * vz - uz * vy;
        this.y += uz * vx - ux * vz;
        this.z += ux * vy - uy * vx;
    }
    /**
     * Return the cross product of the vectors from origin to pointA and pointB.
     *
     * * the result is a vector
     * * the result is perpendicular to both vectors, with right hand orientation
     * * the magnitude of the vector is twice the area of the triangle.
     */
    static createCrossProductToPoints(origin, pointA, pointB, result) {
        return Vector3d.createCrossProduct(pointA.x - origin.x, pointA.y - origin.y, pointA.z - origin.z, pointB.x - origin.x, pointB.y - origin.y, pointB.z - origin.z, result);
    }
    /**
     * Return a vector defined by polar coordinates distance and angle from x axis
     * @param r distance measured from origin
     * @param theta angle from x axis to the vector (in xy plane)
     * @param z optional z coordinate
     */
    static createPolar(r, theta, z) {
        return Vector3d.create(r * theta.cos(), r * theta.sin(), z);
    }
    /**
     * Return a vector defined in spherical coordinates.
     * @param r sphere radius
     * @param theta angle in xy plane
     * @param phi angle from xy plane to the vector
     */
    static createSpherical(r, theta, phi) {
        const cosPhi = phi.cos();
        return Vector3d.create(cosPhi * r * theta.cos(), cosPhi * r * theta.sin(), phi.sin());
    }
    static fromJSON(json) { const val = new Vector3d(); val.setFromJSON(json); return val; }
    /** Copy contents from another Point3d, Point2d, Vector2d, or Vector3d */
    static createFrom(data, result) {
        if (data instanceof Float64Array) {
            if (data.length >= 3)
                return Vector3d.create(data[0], data[1], data[2]);
            if (data.length >= 2)
                return Vector3d.create(data[0], data[1], 0);
            if (data.length >= 1)
                return Vector3d.create(data[0], 0, 0);
            return Vector3d.create(0, 0, 0);
        }
        return Vector3d.create(data.x, data.y, XYZ.hasZ(data) ? data.z : 0.0, result);
    }
    /**
     * Return a vector defined by start and end points (end - start).
     * @param start start point for vector
     * @param end end point for vector
     * @param result optional result
     */
    static createStartEnd(start, end, result) {
        if (result) {
            result.set(end.x - start.x, end.y - start.y, end.z - start.z);
            return result;
        }
        return new Vector3d(end.x - start.x, end.y - start.y, end.z - start.z);
    }
    /**
     * @param x0 start point x coordinate
     * @param y0 start point y coordinate
     * @param z0 start point z coordinate
     * @param x1 end point x coordinate
     * @param y1 end point y coordinate
     * @param z1 end point z coordinate
     * @param result optional result vector
     */
    static createStartEndXYZXYZ(x0, y0, z0, x1, y1, z1, result) {
        if (result) {
            result.set(x1 - x0, y1 - y0, z1 - z0);
            return result;
        }
        return new Vector3d(x1 - x0, y1 - y0, z1 - z0);
    }
    /**
     * Return a vector which is the input vector rotated around the axis vector.
     * @param vector initial vector
     * @param axis axis of rotation
     * @param angle angle of rotation.  If undefined, 90 degrees is implied
     * @param result optional result vector
     */
    static createRotateVectorAroundVector(vector, axis, angle) {
        // Rodriguez formula, https://en.wikipedia.org/wiki/Rodrigues'_rotation_formula
        const unitAxis = axis.normalize();
        if (unitAxis) {
            const xProduct = unitAxis.crossProduct(vector);
            if (angle) {
                const c = angle.cos();
                const s = angle.sin();
                return Vector3d.createAdd3Scaled(vector, c, xProduct, s, unitAxis, unitAxis.dotProduct(vector) * (1.0 - c));
            }
            else {
                // implied c = 0, s = 1 . . .
                return vector.plusScaled(unitAxis, unitAxis.dotProduct(vector));
            }
        }
        // unchanged vector if axis is null
        return undefined;
    }
    /**
     * Set (replace) xzz components so they are a vector from point0 to point1
     * @param point0 start point of computed vector
     * @param point1 end point of computed vector.
     */
    setStartEnd(point0, point1) {
        this.x = point1.x - point0.x;
        this.y = point1.y - point0.y;
        this.z = point1.z - point0.z;
    }
    /** Return a vector with 000 xyz parts. */
    static createZero(result) { return Vector3d.create(0, 0, 0, result); }
    /** Return a unit X vector optionally multiplied by a scale  */
    static unitX(scale = 1) { return new Vector3d(scale, 0, 0); }
    /** Return a unit Y vector  */
    static unitY(scale = 1) { return new Vector3d(0, scale, 0); }
    /** Return a unit Z vector  */
    static unitZ(scale = 1) { return new Vector3d(0, 0, scale); }
    /** Divide by denominator, but return undefined if denominator is zero. */
    safeDivideOrNull(denominator, result) {
        if (denominator !== 0.0) {
            return this.scale(1.0 / denominator, result);
        }
        return undefined;
    }
    /**
     * Return a pair object containing (a) property `v` which is a unit vector in the direction
     * of the input and (b) property mag which is the magnitude (length) of the input (instance) prior to normalization.
     * If the instance (input) is a near zero length the `v` property of the output is undefined.
     * @param result optional result.
     */
    normalizeWithLength(result) {
        const magnitude = Geometry_1.Geometry.correctSmallMetricDistance(this.magnitude());
        result = result ? result : new Vector3d();
        return { v: this.safeDivideOrNull(magnitude, result), mag: magnitude };
    }
    /**
     * Return a unit vector parallel with this.  Return undefined if this.magnitude is near zero.
     * @param result optional result.
     */
    normalize(result) { return this.normalizeWithLength(result).v; }
    /**
     * If this vector has nonzero length, divide by the length to change to a unit vector.
     * @returns true if normalization completed.
     */
    normalizeInPlace() {
        const a = Geometry_1.Geometry.inverseMetricDistance(this.magnitude());
        if (!a)
            return false;
        this.x *= a;
        this.y *= a;
        this.z *= a;
        return true;
    }
    /** Return the fractional projection of spaceVector onto this */
    fractionOfProjectionToVector(target, defaultFraction = 0) {
        const numerator = this.dotProduct(target);
        const denominator = target.magnitudeSquared();
        if (denominator < Geometry_1.Geometry.smallMetricDistanceSquared)
            return defaultFraction;
        return numerator / denominator;
    }
    /** Return a new vector with components negated from the calling instance.
     * @param result optional result vector.
     */
    negate(result) {
        result = result ? result : new Vector3d();
        result.x = -this.x;
        result.y = -this.y;
        result.z = -this.z;
        return result;
    }
    /** Return a vector same length as this but rotate 90 degrees CCW */
    rotate90CCWXY(result) {
        result = result ? result : new Vector3d();
        // save x,y to allow aliasing ..
        const xx = this.x;
        const yy = this.y;
        result.x = -yy;
        result.y = xx;
        result.z = this.z;
        return result;
    }
    unitPerpendicularXY(result) {
        result = result ? result : new Vector3d();
        const xx = this.x;
        const yy = this.y;
        result.x = -yy;
        result.y = xx;
        result.z = 0.0;
        const d2 = xx * xx + yy * yy;
        if (d2 !== 0.0) {
            const a = 1.0 / Math.sqrt(d2);
            result.x *= a;
            result.y *= a;
        }
        return result;
    }
    rotateXY(angle, result) {
        const s = angle.sin();
        const c = angle.cos();
        const xx = this.x;
        const yy = this.y;
        result = result ? result : new Vector3d();
        result.x = xx * c - yy * s;
        result.y = xx * s + yy * c;
        result.z = this.z;
        return result;
    }
    rotate90Towards(target, result) {
        const normal = this.crossProduct(target).normalize();
        return normal ? normal.crossProduct(this, result) : undefined;
    }
    rotate90Around(axis, result) {
        const unitNormal = axis.normalize();
        return unitNormal ? unitNormal.crossProduct(this).plusScaled(unitNormal, unitNormal.dotProduct(this), result) : undefined;
    }
    // Adding vectors
    interpolate(fraction, right, result) {
        result = result ? result : new Vector3d();
        if (fraction <= 0.5) {
            result.x = this.x + fraction * (right.x - this.x);
            result.y = this.y + fraction * (right.y - this.y);
            result.z = this.z + fraction * (right.z - this.z);
        }
        else {
            const t = fraction - 1.0;
            result.x = right.x + t * (right.x - this.x);
            result.y = right.y + t * (right.y - this.y);
            result.z = right.z + t * (right.z - this.z);
        }
        return result;
    }
    plus(vector, result) {
        result = result ? result : new Vector3d();
        result.x = this.x + vector.x;
        result.y = this.y + vector.y;
        result.z = this.z + vector.z;
        return result;
    }
    minus(vector, result) {
        result = result ? result : new Vector3d();
        result.x = this.x - vector.x;
        result.y = this.y - vector.y;
        result.z = this.z - vector.z;
        return result;
    }
    /** Return vector + vector * scalar */
    plusScaled(vector, scaleFactor, result) {
        result = result ? result : new Vector3d();
        result.x = this.x + vector.x * scaleFactor;
        result.y = this.y + vector.y * scaleFactor;
        result.z = this.z + vector.z * scaleFactor;
        return result;
    }
    /** Return point + vectorA * scalarA + vectorB * scalarB */
    plus2Scaled(vectorA, scalarA, vectorB, scalarB, result) {
        result = result ? result : new Vector3d();
        result.x = this.x + vectorA.x * scalarA + vectorB.x * scalarB;
        result.y = this.y + vectorA.y * scalarA + vectorB.y * scalarB;
        result.z = this.z + vectorA.z * scalarA + vectorB.z * scalarB;
        return result;
    }
    /** Return `point + vectorA * scalarA + vectorB * scalarB + vectorC * scalarC` */
    plus3Scaled(vectorA, scalarA, vectorB, scalarB, vectorC, scalarC, result) {
        result = result ? result : new Vector3d();
        result.x = this.x + vectorA.x * scalarA + vectorB.x * scalarB + vectorC.x * scalarC;
        result.y = this.y + vectorA.y * scalarA + vectorB.y * scalarB + vectorC.y * scalarC;
        result.z = this.z + vectorA.z * scalarA + vectorB.z * scalarB + vectorC.z * scalarC;
        return result;
    }
    /** Return `point + vectorA * scalarA + vectorB * scalarB` */
    static createAdd2Scaled(vectorA, scaleA, vectorB, scaleB, result) {
        return Vector3d.create(vectorA.x * scaleA + vectorB.x * scaleB, vectorA.y * scaleA + vectorB.y * scaleB, vectorA.z * scaleA + vectorB.z * scaleB, result);
    }
    /** Return `point + vectorA * scalarA + vectorB * scalarB` with all components presented as numbers */
    static createAdd2ScaledXYZ(ax, ay, az, scaleA, bx, by, bz, scaleB, result) {
        return Vector3d.create(ax * scaleA + bx * scaleB, ay * scaleA + by * scaleB, az * scaleA + bz * scaleB, result);
    }
    static createAdd3Scaled(vectorA, scaleA, vectorB, scaleB, vectorC, scaleC, result) {
        return Vector3d.create(vectorA.x * scaleA + vectorB.x * scaleB + vectorC.x * scaleC, vectorA.y * scaleA + vectorB.y * scaleB + vectorC.y * scaleC, vectorA.z * scaleA + vectorB.z * scaleB + vectorC.z * scaleC, result);
    }
    /** Return vector * scalar */
    scale(scale, result) {
        result = result ? result : new Vector3d();
        result.x = this.x * scale;
        result.y = this.y * scale;
        result.z = this.z * scale;
        return result;
    }
    scaleToLength(length, result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.magnitude());
        if (mag === 0)
            return new Vector3d();
        return this.scale(length / mag, result);
    }
    unitCrossProduct(vectorB, result) {
        return this.crossProduct(vectorB, result).normalize(result);
    }
    unitCrossProductWithDefault(vectorB, x, y, z, result) {
        const unit = this.crossProduct(vectorB, result).normalize(result);
        if (unit === undefined)
            return Vector3d.create(x, y, z, result);
        return unit;
    }
    normalizeWithDefault(x, y, z, result) {
        const unit = this.normalize(result);
        if (unit)
            return unit;
        return Vector3d.create(x, y, z, result);
    }
    tryNormalizeInPlace(smallestMagnitude = Geometry_1.Geometry.smallMetricDistance) {
        const a = this.magnitude();
        if (a < smallestMagnitude || a === 0.0)
            return false;
        this.scaleInPlace(1.0 / a);
        return true;
    }
    sizedCrossProduct(vectorB, productLength, result) {
        result = this.crossProduct(vectorB, result);
        if (result.tryNormalizeInPlace()) {
            result.scaleInPlace(productLength);
            return result;
        }
        return undefined;
    }
    // products
    crossProductMagnitudeSquared(vectorB) {
        const xx = this.y * vectorB.z - this.z * vectorB.y;
        const yy = this.z * vectorB.x - this.x * vectorB.z;
        const zz = this.x * vectorB.y - this.y * vectorB.x;
        return xx * xx + yy * yy + zz * zz;
    }
    crossProductMagnitude(vectorB) {
        return Math.sqrt(this.crossProductMagnitudeSquared(vectorB));
    }
    dotProduct(vectorB) {
        return this.x * vectorB.x + this.y * vectorB.y + this.z * vectorB.z;
    }
    /** Dot product with vector from pointA to pointB */
    dotProductStartEnd(pointA, pointB) {
        return this.x * (pointB.x - pointA.x)
            + this.y * (pointB.y - pointA.y)
            + this.z * (pointB.z - pointA.z);
    }
    /** Cross product with vector from pointA to pointB */
    crossProductStartEnd(pointA, pointB, result) {
        return Vector3d.createCrossProduct(this.x, this.y, this.z, pointB.x - pointA.x, pointB.y - pointA.y, pointB.z - pointA.z, result);
    }
    /** Cross product (xy parts only) with vector from pointA to pointB */
    crossProductStartEndXY(pointA, pointB) {
        return Geometry_1.Geometry.crossProductXYXY(this.x, this.y, pointB.x - pointA.x, pointB.y - pointA.y);
    }
    /** Dot product with vector from pointA to pointB, with pointB given as x,y,z */
    dotProductStartEndXYZ(pointA, x, y, z) {
        return this.x * (x - pointA.x)
            + this.y * (y - pointA.y)
            + this.z * (z - pointA.z);
    }
    /** Dot product with vector from pointA to pointB, with pointB given as (weighted) x,y,z,w
     * * pointB is a homogeneous point that has to be unweighted
     * * if the weight is near zero metric, the return is zero.
     */
    dotProductStartEndXYZW(pointA, x, y, z, w) {
        if (Geometry_1.Geometry.isSmallMetricDistance(w))
            return 0.0;
        const dw = 1.0 / w;
        return this.x * (dw * x - pointA.x)
            + this.y * (dw * y - pointA.y)
            + this.z * (dw * z - pointA.z);
    }
    /** Return the dot product of the instance and vectorB, using only the x and y parts. */
    dotProductXY(vectorB) {
        return this.x * vectorB.x + this.y * vectorB.y;
    }
    /**
     * Dot product with vector (x,y,z)
     * @param x x component for dot product
     * @param y y component for dot product
     * @param z z component for dot product
     */
    dotProductXYZ(x, y, z = 0) {
        return this.x * x + this.y * y + this.z * z;
    }
    /** Return the triple product of the instance, vectorB, and vectorC  */
    tripleProduct(vectorB, vectorC) {
        return Geometry_1.Geometry.tripleProduct(this.x, this.y, this.z, vectorB.x, vectorB.y, vectorB.z, vectorC.x, vectorC.y, vectorC.z);
    }
    /** Return the cross product of the instance and vectorB, using only the x and y parts. */
    crossProductXY(vectorB) {
        return this.x * vectorB.y - this.y * vectorB.x;
    }
    crossProduct(vectorB, result) {
        return Vector3d.createCrossProduct(this.x, this.y, this.z, vectorB.x, vectorB.y, vectorB.z, result);
    }
    // angles
    angleTo(vectorB) {
        return Geometry_1.Angle.createAtan2(this.crossProductMagnitude(vectorB), this.dotProduct(vectorB));
    }
    angleToXY(vectorB) {
        return Geometry_1.Angle.createAtan2(this.crossProductXY(vectorB), this.dotProductXY(vectorB));
    }
    planarRadiansTo(vector, planeNormal) {
        const square = planeNormal.dotProduct(planeNormal);
        if (square === 0.0)
            return 0.0;
        const factor = 1.0 / square;
        const projection0 = this.plusScaled(planeNormal, -this.dotProduct(planeNormal) * factor);
        const projection1 = vector.plusScaled(planeNormal, -vector.dotProduct(planeNormal) * factor);
        return projection0.signedRadiansTo(projection1, planeNormal);
    }
    planarAngleTo(vector, planeNormal) {
        return Geometry_1.Angle.createRadians(this.planarRadiansTo(vector, planeNormal));
    }
    signedRadiansTo(vector1, vectorW) {
        const p = this.crossProduct(vector1);
        const theta = Math.atan2(p.magnitude(), this.dotProduct(vector1));
        if (vectorW.dotProduct(p) < 0.0)
            return -theta;
        else
            return theta;
    }
    signedAngleTo(vector1, vectorW) { return Geometry_1.Angle.createRadians(this.signedRadiansTo(vector1, vectorW)); }
    /*  smallerUnorientedAngleTo(vectorB: Vector3d): Angle { }
      signedAngleTo(vectorB: Vector3d, upVector: Vector3d): Angle { }
      // sectors
      isInSmallerSector(vectorA: Vector3d, vectorB: Vector3d): boolean { }
      isInCCWSector(vectorA: Vector3d, vectorB: Vector3d, upVector: Vector3d): boolean { }
      */
    /**
     * Test if this vector is parallel to other.
     * @param other second vector in comparison
     * @param oppositeIsParallel if the vectors are on the same line but in opposite directions, return this value.
     * @param returnValueIfAnInputIsZeroLength if either vector is near zero length, return this value.
     */
    isParallelTo(other, oppositeIsParallel = false, returnValueIfAnInputIsZeroLength = false) {
        const a2 = this.magnitudeSquared();
        const b2 = other.magnitudeSquared();
        // we know both are 0 or positive -- no need for
        if (a2 < Geometry_1.Geometry.smallMetricDistanceSquared || b2 < Geometry_1.Geometry.smallMetricDistanceSquared)
            return returnValueIfAnInputIsZeroLength;
        const dot = this.dotProduct(other);
        if (dot < 0.0 && !oppositeIsParallel)
            return returnValueIfAnInputIsZeroLength;
        const cross2 = this.crossProductMagnitudeSquared(other);
        /* a2,b2,cross2 are squared lengths of respective vectors */
        /* cross2 = sin^2(theta) * a2 * b2 */
        /* For small theta, sin^2(theta)~~theta^2 */
        return cross2 <= Geometry_1.Geometry.smallAngleRadiansSquared * a2 * b2;
    }
    /**
     * Test if this vector is perpendicular to other.
     * @param other second vector in comparison
     * @param returnValueIfAnInputIsZeroLength if either vector is near zero length, return this value.
     */
    isPerpendicularTo(other, returnValueIfAnInputIsZeroLength = false) {
        const aa = this.magnitudeSquared();
        if (aa < Geometry_1.Geometry.smallMetricDistanceSquared)
            return returnValueIfAnInputIsZeroLength;
        const bb = other.magnitudeSquared();
        if (bb < Geometry_1.Geometry.smallMetricDistanceSquared)
            return returnValueIfAnInputIsZeroLength;
        const ab = this.dotProduct(other);
        return ab * ab <= Geometry_1.Geometry.smallAngleRadiansSquared * aa * bb;
    }
}
exports.Vector3d = Vector3d;
class Segment1d {
    constructor(x0, x1) {
        this.x0 = x0;
        this.x1 = x1;
    }
    set(x0, x1) { this.x0 = x0, this.x1 = x1; }
    static create(x0 = 0, x1 = 1, result) {
        if (!result)
            return new Segment1d(x0, x1);
        result.set(x0, x1);
        return result;
    }
    setFrom(other) { this.x0 = other.x0; this.x1 = other.x1; }
    clone() { return new Segment1d(this.x0, this.x1); }
    fractionToPoint(fraction) { return Geometry_1.Geometry.interpolate(this.x0, fraction, this.x1); }
    reverseInPlace() { const x = this.x0; this.x0 = this.x1; this.x1 = x; }
    /**
     * Near equality test, using Geometry.isSameCoordinate for tolerances.
     */
    isAlmostEqual(other) {
        return Geometry_1.Geometry.isSameCoordinate(this.x0, other.x0) && Geometry_1.Geometry.isSameCoordinate(this.x1, other.x1);
    }
    /**
     * Return true if the segment limits are (exactly) 0 and 1
     */
    get isExact01() { return this.x0 === 0.0 && this.x1 === 1.0; }
}
exports.Segment1d = Segment1d;
/** Three angles that determine the orientation of an object in space. Sometimes referred to as [Tait–Bryan angles](https://en.wikipedia.org/wiki/Euler_angles). */
class YawPitchRollAngles {
    constructor(yaw = Geometry_1.Angle.zero(), pitch = Geometry_1.Angle.zero(), roll = Geometry_1.Angle.zero()) {
        this.yaw = yaw;
        this.pitch = pitch;
        this.roll = roll;
    }
    /** Freeze this YawPitchRollAngles */
    freeze() { Object.freeze(this.yaw); Object.freeze(this.pitch); Object.freeze(this.roll); }
    /** constructor for YawPitchRollAngles with angles in degrees. */
    static createDegrees(yawDegrees, pitchDegrees, rollDegrees) {
        return new YawPitchRollAngles(Geometry_1.Angle.createDegrees(yawDegrees), Geometry_1.Angle.createDegrees(pitchDegrees), Geometry_1.Angle.createDegrees(rollDegrees));
    }
    /** constructor for YawPitchRollAngles with angles in radians. */
    static createRadians(yawRadians, pitchRadians, rollRadians) {
        return new YawPitchRollAngles(Geometry_1.Angle.createRadians(yawRadians), Geometry_1.Angle.createRadians(pitchRadians), Geometry_1.Angle.createRadians(rollRadians));
    }
    static fromJSON(json) {
        json = json ? json : {};
        return new YawPitchRollAngles(Geometry_1.Angle.fromJSON(json.yaw), Geometry_1.Angle.fromJSON(json.pitch), Geometry_1.Angle.fromJSON(json.roll));
    }
    setFromJSON(json) {
        json = json ? json : {};
        this.yaw = Geometry_1.Angle.fromJSON(json.yaw);
        this.pitch = Geometry_1.Angle.fromJSON(json.pitch);
        this.roll = Geometry_1.Angle.fromJSON(json.roll);
    }
    /** Convert to a JSON object of form { pitch: 20 , roll: 29.999999999999996 , yaw: 10 }. Any values that are exactly zero (with tolerance `Geometry.smallAngleRadians`) are omitted. */
    toJSON() {
        const val = {};
        if (!this.pitch.isAlmostZero)
            val.pitch = this.pitch.toJSON();
        if (!this.roll.isAlmostZero)
            val.roll = this.roll.toJSON();
        if (!this.yaw.isAlmostZero)
            val.yaw = this.yaw.toJSON();
        return val;
    }
    /**
     * Install all rotations from `other` into `this`.
     * @param other YawPitchRollAngles source
     */
    setFrom(other) {
        this.yaw.setFrom(other.yaw);
        this.pitch.setFrom(other.pitch);
        this.roll.setFrom(other.roll);
    }
    /**
     * * Compare angles between `this` and `other`.
     * * Comparisons are via `isAlmostEqualAllowPeriodShift`.
     * @param other YawPitchRollAngles source
     */
    isAlmostEqual(other) {
        return this.yaw.isAlmostEqualAllowPeriodShift(other.yaw)
            && this.pitch.isAlmostEqualAllowPeriodShift(other.pitch)
            && this.roll.isAlmostEqualAllowPeriodShift(other.roll);
    }
    /**
     * Make a copy of this YawPitchRollAngles.
     */
    clone() { return new YawPitchRollAngles(this.yaw.clone(), this.pitch.clone(), this.roll.clone()); }
    /**
     * Expand the angles into a (rigid rotation) matrix.
     *
     * * The returned matrix is "rigid" -- unit length rows and columns, and its transpose is its inverse.
     * * The "rigid" matrix is always a right handed coordinate system.
     * @param result optional pre-allocated `Matrix3d`
     */
    toMatrix3d(result) {
        const c0 = Math.cos(this.yaw.radians);
        const s0 = Math.sin(this.yaw.radians);
        const c1 = Math.cos(this.pitch.radians);
        const s1 = Math.sin(this.pitch.radians);
        const c2 = Math.cos(this.roll.radians);
        const s2 = Math.sin(this.roll.radians);
        return Transform_1.Matrix3d.createRowValues(c0 * c1, -(s0 * c2 + c0 * s1 * s2), (s0 * s2 - c0 * s1 * c2), s0 * c1, (c0 * c2 - s0 * s1 * s2), -(c0 * s2 + s0 * s1 * c2), s1, c1 * s2, c1 * c2, result);
    }
    /** @returns Return the largest angle in radians */
    maxAbsRadians() {
        return Geometry_1.Geometry.maxAbsXYZ(this.yaw.radians, this.pitch.radians, this.roll.radians);
    }
    /** Return the sum of the angles in squared radians */
    sumSquaredRadians() {
        return Geometry_1.Geometry.hypotenuseSquaredXYZ(this.yaw.radians, this.pitch.radians, this.roll.radians);
    }
    /** @returns true if the rotation is 0 */
    isIdentity(allowPeriodShift = true) {
        if (allowPeriodShift)
            return Geometry_1.Angle.isAlmostEqualRadiansAllowPeriodShift(0.0, this.yaw.radians)
                && Geometry_1.Angle.isAlmostEqualRadiansAllowPeriodShift(0.0, this.pitch.radians)
                && Geometry_1.Angle.isAlmostEqualRadiansAllowPeriodShift(0.0, this.roll.radians);
        else
            return Geometry_1.Angle.isAlmostEqualRadiansNoPeriodShift(0.0, this.yaw.radians)
                && Geometry_1.Angle.isAlmostEqualRadiansNoPeriodShift(0.0, this.pitch.radians)
                && Geometry_1.Angle.isAlmostEqualRadiansNoPeriodShift(0.0, this.roll.radians);
    }
    /** Return the largest difference of angles (in radians) between this and other */
    maxDiffRadians(other) {
        return Math.max(this.yaw.radians - other.yaw.radians, this.pitch.radians - other.pitch.radians, this.roll.radians - other.roll.radians);
    }
    /** Return the largest angle in degrees. */
    maxAbsDegrees() { return Geometry_1.Geometry.maxAbsXYZ(this.yaw.degrees, this.pitch.degrees, this.roll.degrees); }
    /** Return the sum of squared angles in degrees. */
    sumSquaredDegrees() { return Geometry_1.Geometry.hypotenuseSquaredXYZ(this.yaw.degrees, this.pitch.degrees, this.roll.degrees); }
    /** Return an object from a Transform as an origin and YawPitchRollAngles. */
    static tryFromTransform(transform) {
        // bundle up the transform's origin with the angle data extracted from the transform
        return {
            angles: YawPitchRollAngles.createFromMatrix3d(transform.matrix),
            origin: Point3d.createFrom(transform.origin),
        };
    }
    /** Attempts to create a YawPitchRollAngles object from an Matrix3d
     * * This conversion fails if the matrix is not rigid (unit rows and columns, transpose is inverse)
     * * In the failure case the method's return value is `undefined`.
     * * In the failure case, if the optional result was supplied, that result will nonetheless be filled with a set of angles.
     */
    static createFromMatrix3d(matrix, result) {
        const s1 = matrix.at(2, 0);
        const c1 = Math.sqrt(matrix.at(2, 1) * matrix.at(2, 1) + matrix.at(2, 2) * matrix.at(2, 2));
        const pitchA = Geometry_1.Angle.createAtan2(s1, c1); // with positive cosine
        const pitchB = Geometry_1.Angle.createAtan2(s1, -c1); // with negative cosine
        const angles = result ? result : new YawPitchRollAngles(); // default undefined . . .
        if (c1 < Geometry_1.Geometry.smallAngleRadians) { // This is a radians test !!!
            angles.yaw = Geometry_1.Angle.createAtan2(-matrix.at(0, 1), matrix.at(1, 1));
            angles.pitch = pitchA;
            angles.roll = Geometry_1.Angle.createRadians(0.0);
        }
        else {
            const yawA = Geometry_1.Angle.createAtan2(matrix.at(1, 0), matrix.at(0, 0));
            const rollA = Geometry_1.Angle.createAtan2(matrix.at(2, 1), matrix.at(2, 2));
            const yawB = Geometry_1.Angle.createAtan2(-matrix.at(1, 0), -matrix.at(0, 0));
            const rollB = Geometry_1.Angle.createAtan2(-matrix.at(2, 1), -matrix.at(2, 2));
            const yprA = new YawPitchRollAngles(yawA, pitchA, rollA);
            const yprB = new YawPitchRollAngles(yawB, pitchB, rollB);
            const absFactor = 0.95;
            const radiansA = yprA.maxAbsRadians();
            const radiansB = yprB.maxAbsRadians();
            if (radiansA < absFactor * radiansB) {
                angles.setFrom(yprA);
            }
            else if (radiansB < absFactor * radiansA) {
                angles.setFrom(yprB);
            }
            else {
                const sumA = yprA.sumSquaredRadians();
                const sumB = yprB.sumSquaredRadians();
                if (sumA <= sumB) {
                    angles.setFrom(yprA);
                }
                else {
                    angles.setFrom(yprB);
                }
            }
        }
        const matrix1 = angles.toMatrix3d();
        return matrix.maxDiff(matrix1) < Geometry_1.Geometry.smallAngleRadians ? angles : undefined;
    }
}
exports.YawPitchRollAngles = YawPitchRollAngles;
class Point2d extends XY {
    /** Constructor for Point2d */
    constructor(x = 0, y = 0) { super(x, y); }
    clone() { return new Point2d(this.x, this.y); }
    /**
     * Return a point (newly created unless result provided) with given x,y coordinates
     * @param x x coordinate
     * @param y y coordinate
     * @param result optional result
     */
    static create(x = 0, y = 0, result) {
        if (result) {
            result.x = x;
            result.y = y;
            return result;
        }
        return new Point2d(x, y);
    }
    static fromJSON(json) { const val = new Point2d(); val.setFromJSON(json); return val; }
    static createFrom(xy, result) {
        if (xy)
            return Point2d.create(xy.x, xy.y, result);
        return Point2d.create(0, 0, result);
    }
    static createZero(result) { return Point2d.create(0, 0, result); }
    addForwardLeft(tangentFraction, leftFraction, vector) {
        const dx = vector.x;
        const dy = vector.y;
        return Point2d.create(this.x + tangentFraction * dx - leftFraction * dy, this.y + tangentFraction * dy + leftFraction * dx);
    }
    forwardLeftInterpolate(tangentFraction, leftFraction, point) {
        const dx = point.x - this.x;
        const dy = point.y - this.y;
        return Point2d.create(this.x + tangentFraction * dx - leftFraction * dy, this.y + tangentFraction * dy + leftFraction * dx);
    }
    /** Return a point interpolated between this point and the right param. */
    interpolate(fraction, other, result) {
        if (fraction <= 0.5)
            return Point2d.create(this.x + fraction * (other.x - this.x), this.y + fraction * (other.y - this.y), result);
        const t = fraction - 1.0;
        return Point2d.create(other.x + t * (other.x - this.x), other.y + t * (other.y - this.y), result);
    }
    /** Return a point with independent x,y fractional interpolation. */
    interpolateXY(fractionX, fractionY, other, result) {
        return Point2d.create(Geometry_1.Geometry.interpolate(this.x, fractionX, other.x), Geometry_1.Geometry.interpolate(this.y, fractionY, other.y), result);
    }
    /** Return point minus vector */
    minus(vector, result) {
        return Point2d.create(this.x - vector.x, this.y - vector.y, result);
    }
    /** Return point plus vector */
    plus(vector, result) {
        return Point2d.create(this.x + vector.x, this.y + vector.y, result);
    }
    /** Return point plus vector */
    plusXY(dx = 0, dy = 0, result) {
        return Point2d.create(this.x + dx, this.y + dy, result);
    }
    /** Return point + vector * scalar */
    plusScaled(vector, scaleFactor, result) {
        return Point2d.create(this.x + vector.x * scaleFactor, this.y + vector.y * scaleFactor, result);
    }
    /** Return point + vectorA * scalarA + vectorB * scalarB */
    plus2Scaled(vectorA, scalarA, vectorB, scalarB, result) {
        return Point2d.create(this.x + vectorA.x * scalarA + vectorB.x * scalarB, this.y + vectorA.y * scalarA + vectorB.y * scalarB, result);
    }
    /** Return point + vectorA * scalarA + vectorB * scalarB + vectorC * scalarC */
    plus3Scaled(vectorA, scalarA, vectorB, scalarB, vectorC, scalarC, result) {
        return Point2d.create(this.x + vectorA.x * scalarA + vectorB.x * scalarB + vectorC.x * scalarC, this.y + vectorA.y * scalarA + vectorB.y * scalarB + vectorC.y * scalarC, result);
    }
    /**
     * @returns dot product of vector from this to targetA and vector from this to targetB
     * @param targetA target of first vector
     * @param targetB target of second vector
     */
    dotVectorsToTargets(targetA, targetB) {
        return (targetA.x - this.x) * (targetB.x - this.x) +
            (targetA.y - this.y) * (targetB.y - this.y);
    }
    /** Returns the (scalar) cross product of two points/vectors, computed from origin to target1 and target2 */
    crossProductToPoints(target1, target2) {
        const x1 = target1.x - this.x;
        const y1 = target1.y - this.y;
        const x2 = target2.x - this.x;
        const y2 = target2.y - this.y;
        return x1 * y2 - y1 * x2;
    }
    fractionOfProjectionToLine(startPoint, endPoint, defaultFraction) {
        const denominator = startPoint.distanceSquared(endPoint);
        if (denominator < Geometry_1.Geometry.smallMetricDistanceSquared)
            return defaultFraction ? defaultFraction : 0;
        return startPoint.dotVectorsToTargets(endPoint, this) / denominator;
    }
}
exports.Point2d = Point2d;
/** 3D vector with x,y properties */
class Vector2d extends XY {
    constructor(x = 0, y = 0) { super(x, y); }
    clone() { return new Vector2d(this.x, this.y); }
    static create(x = 0, y = 0, result) {
        if (result) {
            result.x = x;
            result.y = y;
            return result;
        }
        return new Vector2d(x, y);
    }
    // unit X vector
    static unitX(scale = 1) { return new Vector2d(scale, 0); }
    // unit Y vector
    static unitY(scale = 1) { return new Vector2d(0, scale); }
    // zero vector
    static createZero(result) { return Vector2d.create(0, 0, result); }
    /** copy contents from another Point3d, Point2d, Vector2d, or Vector3d */
    static createFrom(data, result) {
        if (data instanceof Float64Array) {
            if (data.length >= 2)
                return Vector2d.create(data[0], data[1]);
            if (data.length >= 1)
                return Vector2d.create(data[0], 0);
            return Vector2d.create(0, 0);
        }
        return Vector2d.create(data.x, data.y, result);
    }
    static fromJSON(json) { const val = new Vector2d(); val.setFromJSON(json); return val; }
    static createPolar(r, theta) {
        return Vector2d.create(r * theta.cos());
    }
    static createStartEnd(point0, point1, result) {
        if (result) {
            result.set(point1.x - point0.x, point1.y - point0.y);
            return result;
        }
        return new Vector2d(point1.x - point0.x, point1.y - point0.y);
    }
    /**
     * Return a vector that bisects the angle between two normals and extends to the intersection of two offset lines
     * @param unitPerpA unit perpendicular to incoming direction
     * @param unitPerpB  unit perpendicular to outgoing direction
     * @param offset offset distance
     */
    static createOffsetBisector(unitPerpA, unitPerpB, offset) {
        let bisector = unitPerpA.plus(unitPerpB);
        bisector = bisector.normalize();
        if (bisector) {
            const c = offset * bisector.dotProduct(unitPerpA);
            return bisector.safeDivideOrNull(c);
        }
        return undefined;
    }
    // Divide by denominator, but return undefined if denominator is zero.
    safeDivideOrNull(denominator, result) {
        if (denominator !== 0.0) {
            return this.scale(1.0 / denominator, result);
        }
        return undefined;
    }
    normalize(result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.magnitude());
        result = result ? result : new Vector2d();
        return this.safeDivideOrNull(mag, result);
    }
    /** return the fractional projection of spaceVector onto this */
    fractionOfProjectionToVector(target, defaultFraction) {
        const numerator = this.dotProduct(target);
        const denominator = target.magnitudeSquared();
        if (denominator < Geometry_1.Geometry.smallMetricDistanceSquared)
            return defaultFraction ? defaultFraction : 0;
        return numerator / denominator;
    }
    /** Negate components */
    negate(result) {
        result = result ? result : new Vector2d();
        result.x = -this.x;
        result.y = -this.y;
        return result;
    }
    // return a vector same length as this but rotate 90 degrees CCW
    rotate90CCWXY(result) {
        result = result ? result : new Vector2d();
        // save x,y to allow aliasing ..
        const xx = this.x;
        const yy = this.y;
        result.x = -yy;
        result.y = xx;
        return result;
    }
    // return a vector same length as this but rotate 90 degrees CW
    rotate90CWXY(result) {
        result = result ? result : new Vector2d();
        // save x,y to allow aliasing ..
        const xx = this.x;
        const yy = this.y;
        result.x = yy;
        result.y = -xx;
        return result;
    }
    unitPerpendicularXY(result) {
        result = result ? result : new Vector2d();
        const xx = this.x;
        const yy = this.y;
        result.x = -yy;
        result.y = xx;
        const d2 = xx * xx + yy * yy;
        if (d2 !== 0.0) {
            const a = 1.0 / Math.sqrt(d2);
            result.x *= a;
            result.y *= a;
        }
        return result;
    }
    rotateXY(angle, result) {
        const s = angle.sin();
        const c = angle.cos();
        const xx = this.x;
        const yy = this.y;
        result = result ? result : new Vector2d();
        result.x = xx * c - yy * s;
        result.y = xx * s + yy * c;
        return result;
    }
    /** return the interpolation {this + fraction * (right - this)} */
    interpolate(fraction, right, result) {
        result = result ? result : new Vector2d();
        /* For best last-bit behavior, if fraction is below 0.5, use this as base point.   If above 0.5, use right as base point.   */
        if (fraction <= 0.5) {
            result.x = this.x + fraction * (right.x - this.x);
            result.y = this.y + fraction * (right.y - this.y);
        }
        else {
            const t = fraction - 1.0;
            result.x = right.x + t * (right.x - this.x);
            result.y = right.y + t * (right.y - this.y);
        }
        return result;
    }
    /** return {this + vector}. */
    plus(vector, result) {
        result = result ? result : new Vector2d();
        result.x = this.x + vector.x;
        result.y = this.y + vector.y;
        return result;
    }
    /** return {this - vector}. */
    minus(vector, result) {
        result = result ? result : new Vector2d();
        result.x = this.x - vector.x;
        result.y = this.y - vector.y;
        return result;
    }
    /** Return {point + vector \* scalar} */
    plusScaled(vector, scaleFactor, result) {
        result = result ? result : new Vector2d();
        result.x = this.x + vector.x * scaleFactor;
        result.y = this.y + vector.y * scaleFactor;
        return result;
    }
    /** Return {point + vectorA \* scalarA + vectorB \* scalarB} */
    plus2Scaled(vectorA, scalarA, vectorB, scalarB, result) {
        result = result ? result : new Vector2d();
        result.x = this.x + vectorA.x * scalarA + vectorB.x * scalarB;
        result.y = this.y + vectorA.y * scalarA + vectorB.y * scalarB;
        return result;
    }
    /** Return {this + vectorA \* scalarA + vectorB \* scalarB + vectorC \* scalarC} */
    plus3Scaled(vectorA, scalarA, vectorB, scalarB, vectorC, scalarC, result) {
        result = result ? result : new Vector2d();
        result.x = this.x + vectorA.x * scalarA + vectorB.x * scalarB + vectorC.x * scalarC;
        result.y = this.y + vectorA.y * scalarA + vectorB.y * scalarB + vectorC.y * scalarC;
        return result;
    }
    /** Return {this * scale} */
    scale(scale, result) {
        result = result ? result : new Vector2d();
        result.x = this.x * scale;
        result.y = this.y * scale;
        return result;
    }
    /** return a vector parallel to this but with specified length */
    scaleToLength(length, result) {
        const mag = Geometry_1.Geometry.correctSmallMetricDistance(this.magnitude());
        if (mag === 0)
            return new Vector2d();
        return this.scale(length / mag, result);
    }
    /** return the dot product of this with vectorB */
    dotProduct(vectorB) { return this.x * vectorB.x + this.y * vectorB.y; }
    /** dot product with vector from pointA to pointB */
    dotProductStartEnd(pointA, pointB) {
        return this.x * (pointB.x - pointA.x)
            + this.y * (pointB.y - pointA.y);
    }
    /** vector cross product {this CROSS vectorB} */
    crossProduct(vectorB) { return this.x * vectorB.y - this.y * vectorB.x; }
    /** return the (signed) angle from this to vectorB.   This is positive if the shortest turn is counterclockwise, negative if clockwise. */
    angleTo(vectorB) {
        return Geometry_1.Angle.createAtan2(this.crossProduct(vectorB), this.dotProduct(vectorB));
    }
    /*  smallerUnorientedAngleTo(vectorB: Vector2d): Angle { }
      signedAngleTo(vectorB: Vector2d, upVector: Vector2d): Angle { }
      planarAngleTo(vectorB: Vector2d, planeNormal: Vector2d): Angle { }
      // sectors
      isInSmallerSector(vectorA: Vector2d, vectorB: Vector2d): boolean { }
      isInCCWSector(vectorA: Vector2d, vectorB: Vector2d, upVector: Vector2d): boolean { }
      */
    isParallelTo(other, oppositeIsParallel = false) {
        const a2 = this.magnitudeSquared();
        const b2 = other.magnitudeSquared();
        // we know both are 0 or positive -- no need for
        if (a2 < Geometry_1.Geometry.smallMetricDistanceSquared || b2 < Geometry_1.Geometry.smallMetricDistanceSquared)
            return false;
        const dot = this.dotProduct(other);
        if (dot < 0.0 && !oppositeIsParallel)
            return false;
        const cross = this.crossProduct(other);
        /* a2,b2,cross2 are squared lengths of respective vectors */
        /* cross2 = sin^2(theta) * a2 * b2 */
        /* For small theta, sin^2(theta)~~theta^2 */
        return cross * cross <= Geometry_1.Geometry.smallAngleRadiansSquared * a2 * b2;
    }
    /**
     * @returns `true` if `this` vector is perpendicular to `other`.
     * @param other second vector.
     */
    isPerpendicularTo(other) {
        return Geometry_1.Angle.isPerpendicularDotSet(this.magnitudeSquared(), other.magnitudeSquared(), this.dotProduct(other));
    }
}
exports.Vector2d = Vector2d;
//# sourceMappingURL=PointVector.js.map