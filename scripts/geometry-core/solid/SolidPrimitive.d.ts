/** @module Solid */
import { CurveCollection } from "../curve/CurveCollection";
import { GeometryQuery } from "../curve/GeometryQuery";
import { Transform } from "../geometry3d/Transform";
import { Box } from "./Box";
import { Cone } from "./Cone";
import { Sphere } from "./Sphere";
import { LinearSweep } from "./LinearSweep";
import { RotationalSweep } from "./RotationalSweep";
import { RuledSweep } from "./RuledSweep";
import { TorusPipe } from "./TorusPipe";
/** Describes the concrete type of a [[SolidPrimitive]]. Each type name maps to a specific subclass and can be used for type-switching in conditional statements.
 *
 *  - "box" => [[Box]]
 *  - "cone" => [[Cone]]
 *  - "sphere" => [[Sphere]]
 *  - "linearSweep" => [[LinearSweep]]
 *  - "rotationalSweep" => [[RotationalSweep]]
 *  - "ruledSweep" => [[RuledSweep]]
 *  - "torusPipe" => [[TorusPipe]]
 *
 * @public
 */
export declare type SolidPrimitiveType = "box" | "cone" | "sphere" | "linearSweep" | "rotationalSweep" | "ruledSweep" | "torusPipe";
/** Union type of all subclasses of [[SolidPrimitive]].
 * @public
 */
export declare type AnySolidPrimitive = Box | Cone | Sphere | LinearSweep | RotationalSweep | RuledSweep | TorusPipe;
/**
 * Base class for SolidPrimitive variants.
 *
 * * The base class holds capped flag for all derived classes.
 * @public
 */
export declare abstract class SolidPrimitive extends GeometryQuery {
    /** String name for schema properties */
    readonly geometryCategory = "solid";
    /** String name for schema properties */
    abstract readonly solidPrimitiveType: SolidPrimitiveType;
    /** flag indicating whether cap region is considered closed (i.e. a planar region, rather than just a wire in space) */
    protected _capped: boolean;
    protected constructor(capped: boolean);
    /** Ask if this is a capped solid */
    /** Set the capped flag */
    capped: boolean;
    /** Return a cross section at specified vFraction. */
    abstract constantVSection(_vFraction: number): CurveCollection | undefined;
    /** Return a Transform from the local system of the solid to world.
     * * The particulars of origin and orientation are specific to each SolidPrimitive type.
     */
    abstract getConstructiveFrame(): Transform | undefined;
    /**
     * @return true if this is a closed volume.
     * * LinearSweep, Box, Cone only depend on capped.
     * * Sphere affected by capped and latitude sweep
     * * TorusPipe and RotationalSweep affected by capped and sweep
     * * RuledSweep is affected by capped and match of first, last contour
     */
    abstract readonly isClosedVolume: boolean;
}
//# sourceMappingURL=SolidPrimitive.d.ts.map