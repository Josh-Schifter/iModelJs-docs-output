"use strict";
/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/** @module Topology */
const Graph_1 = require("./Graph");
const Merging_1 = require("./Merging");
//   /* tslint:disable:no-console */
/**
 * * Context for regularizing single faces.
 * @internal
 */
class RegularizationContext {
    constructor(graph) {
        this.graph = graph;
        this.upEdges = [];
        this.downEdges = [];
        this.bottomPeaks = [];
        this.topPeaks = [];
        this.localMin = [];
        this.localMax = [];
    }
    /**
     * Collect (and classify) all the edges around a single face.
     * * The various arrays are collected: upEdges, downEdges, topPeaks, bottomPeaks, upChains, downChains
     * @param faceSeed face to examine
     */
    collectVerticalEventsAroundFace(faceSeed) {
        let nodeA = faceSeed;
        let nodeB;
        let nodeC;
        let abUp;
        let bcUp;
        this.upEdges.length = 0;
        this.downEdges.length = 0;
        this.topPeaks.length = 0;
        this.bottomPeaks.length = 0;
        this.localMin.length = 0;
        this.localMax.length = 0;
        do {
            nodeB = nodeA.faceSuccessor;
            nodeC = nodeB.faceSuccessor;
            abUp = Merging_1.HalfEdgeGraphOps.compareNodesYXUp(nodeA, nodeB) < 0;
            bcUp = Merging_1.HalfEdgeGraphOps.compareNodesYXUp(nodeB, nodeC) < 0;
            if (abUp) {
                this.upEdges.push(nodeA);
                if (!bcUp) {
                    if (Merging_1.HalfEdgeGraphOps.crossProductToTargets(nodeB, nodeA, nodeC) < 0)
                        this.localMax.push(nodeB);
                    else
                        this.topPeaks.push(nodeB);
                }
            }
            else { // ab is DOWN
                this.downEdges.push(nodeA);
                if (bcUp) {
                    if (Merging_1.HalfEdgeGraphOps.crossProductToTargets(nodeB, nodeA, nodeC) > 0)
                        this.bottomPeaks.push(nodeB);
                    else
                        this.localMin.push(nodeB);
                }
            }
            nodeA = nodeB;
        } while (nodeA !== faceSeed);
    }
    /**
     * Collect (and classify) all the edges in an array.
     * * The various arrays are collected: upEdges, downEdges, topPeaks, bottomPeaks, upChains, downChains
     * @param candidateEdges array of edges.
     */
    collectVerticalEventFromEdgesInAndArray(candidateEdges) {
        let nodeA;
        let nodeB;
        let nodeC;
        let abUp;
        let bcUp;
        this.upEdges.length = 0;
        this.downEdges.length = 0;
        this.topPeaks.length = 0;
        this.bottomPeaks.length = 0;
        this.localMin.length = 0;
        this.localMax.length = 0;
        for (nodeA of candidateEdges) {
            nodeB = nodeA.faceSuccessor;
            nodeC = nodeB.faceSuccessor;
            abUp = Merging_1.HalfEdgeGraphOps.compareNodesYXUp(nodeA, nodeB) < 0;
            bcUp = Merging_1.HalfEdgeGraphOps.compareNodesYXUp(nodeB, nodeC) < 0;
            if (abUp) {
                this.upEdges.push(nodeA);
                if (!bcUp) {
                    if (Merging_1.HalfEdgeGraphOps.crossProductToTargets(nodeB, nodeA, nodeC) < 0)
                        this.localMax.push(nodeB);
                    else
                        this.topPeaks.push(nodeB);
                }
            }
            else { // ab is DOWN
                this.downEdges.push(nodeA);
                if (bcUp) {
                    if (Merging_1.HalfEdgeGraphOps.crossProductToTargets(nodeB, nodeA, nodeC) > 0)
                        this.bottomPeaks.push(nodeB);
                    else
                        this.localMin.push(nodeB);
                }
            }
        }
    }
    swapArrays() {
        let save = this.downEdges;
        this.downEdges = this.upEdges;
        this.upEdges = save;
        save = this.localMax;
        this.localMax = this.localMin;
        this.localMin = save;
        save = this.topPeaks;
        this.topPeaks = this.bottomPeaks;
        this.bottomPeaks = save;
    }
    /**
     * Find the edge (among candidates) which is first struck by a "rightward" scan from node
     * * comparisonFunction determines scan sense
     *   * HalfEdge.compareNodeYXTheta is an upward scan.
     *   * HalfEdge.compareNodeYXThetaDownward is a downward scan.
     * @param node
     * @param candidates Array of nodes to search
     * @param nodeComparisonFunction function for lexical comparison.
     */
    findTopVisibleEdge(node, candidates, directionSign) {
        const y0 = node.y;
        const x0 = node.x;
        let dx;
        let distanceRight = Number.MAX_SAFE_INTEGER;
        let result;
        for (const rightBase of candidates) {
            const rightTop = rightBase.faceSuccessor;
            if (rightBase === node || rightTop === node)
                continue;
            // for horizontal edge cases -- require edges ends to have strict sign change (no zeros!!)
            const cRight = Merging_1.HalfEdgeGraphOps.compareNodesYXUp(node, rightBase);
            const cTop = Merging_1.HalfEdgeGraphOps.compareNodesYXUp(node, rightTop);
            // console.log(node.id, rightBase.id, rightTop.id, cRight, cTop);
            if (cRight * cTop >= 0)
                continue;
            const fraction = Graph_1.HalfEdge.horizontalScanFraction01(rightBase, y0);
            if (fraction !== undefined) {
                dx = directionSign * (rightBase.fractionToX(fraction) - x0);
                if (dx > 0 && dx < distanceRight) {
                    result = rightBase;
                    distanceRight = dx;
                }
            }
        }
        return result;
    }
    /**
     *
     * @param downPeak a "bottom" node where the interior CCW loop has a local min
     * @param downEdgeStart (optional) node at the start (heading downwards!) of an edge that brackets downPeak on the left.
     * @param upEdgeStart  (optional) node at the start (heading up!) of the edge that brackets downPeak on the right.
     */
    highestUpPeakConnection(downPeak, downEdgeStart, upEdgeStart) {
        let highestPeak;
        for (const upPeak of this.topPeaks) {
            const y0 = upPeak.y;
            const x0 = upPeak.x;
            // is upPeak higher than prior upPeak?
            if (highestPeak !== undefined && Merging_1.HalfEdgeGraphOps.compareNodesYXUp(upPeak, highestPeak) < 0)
                continue;
            // is upPeak BELOW downPeak, ABOVE both limit edges lower node, and between limit edge interiors.
            if (Merging_1.HalfEdgeGraphOps.compareNodesYXUp(upPeak, downPeak) < 0) {
                if (downEdgeStart) {
                    const fraction = Graph_1.HalfEdge.horizontalScanFraction01(downEdgeStart, y0);
                    if (fraction === undefined)
                        continue;
                    if (x0 <= downEdgeStart.fractionToX(fraction))
                        continue;
                }
                if (upEdgeStart) {
                    const fraction = Graph_1.HalfEdge.horizontalScanFraction01(upEdgeStart, y0);
                    if (fraction === undefined)
                        continue;
                    if (upEdgeStart.fractionToX(fraction) <= x0)
                        continue;
                }
                highestPeak = upPeak;
            }
        }
        return highestPeak;
    }
    updateMaxNode(maxNode, candidate, compare) {
        if (!maxNode)
            return candidate;
        if (!candidate)
            return maxNode;
        // both are defined .. look for positive compare ...
        if (compare(maxNode, candidate) < 0)
            return candidate;
        return maxNode;
    }
    negateXY() {
        for (const node of this.graph.allHalfEdges) {
            node.x *= -1;
            node.y *= -1;
        }
    }
    downwardConnectionFromBottomPeak(node) {
        let connectTo;
        const upFunction = Merging_1.HalfEdgeGraphOps.compareNodesYXUp;
        const upEdgeBase = this.findTopVisibleEdge(node, this.upEdges, 1.0);
        const downEdgeBase = this.findTopVisibleEdge(node, this.downEdges, -1.0);
        connectTo = this.updateMaxNode(connectTo, upEdgeBase, upFunction);
        if (downEdgeBase)
            connectTo = this.updateMaxNode(connectTo, downEdgeBase.faceSuccessor, upFunction);
        const upPeakConnection = this.highestUpPeakConnection(node, downEdgeBase, upEdgeBase);
        if (upPeakConnection !== undefined)
            connectTo = this.updateMaxNode(connectTo, upPeakConnection, upFunction);
        return connectTo;
    }
    joinNodes(nodeA, nodeB) {
        const nodeC = this.graph.createEdgeXYZXYZ(nodeA.x, nodeA.y, nodeA.z, 0, nodeB.x, nodeB.y, nodeB.z, 0);
        Graph_1.HalfEdge.pinch(nodeA, nodeC);
        Graph_1.HalfEdge.pinch(nodeB, nodeC.edgeMate);
        return nodeC;
    }
    /**
     * Regularize a single face.
     * * Insert edge from any downward interior vertex to something lower
     * * Insert an edge from each upward interior vertex to something higher.
     * * The face is split into smaller faces
     * * Each final face has at most one "min" and one "max", and is easy to triangulate with a bottom to top sweep.
     * * Normal usage is to sweep in both directions, i.e. use the default (true,true) for the upSweep and downSweep parameters.
     * @param faceSeed any representative half edge on the face
     * @param upSweep true to do the upward sweep.
     * @param downSweep true to do the downward sweep.
     */
    runRegularization(upSweep = true, downSweep = true) {
        if (upSweep) {
            this.bottomPeaks.sort(Merging_1.HalfEdgeGraphOps.compareNodesYXUp);
            for (const bottomPeak of this.bottomPeaks) {
                // console.log("SEARCH", bottomPeak.id, [bottomPeak.x, bottomPeak.y]);
                if (!Merging_1.HalfEdgeGraphOps.isDownPeak(bottomPeak))
                    continue;
                const target = this.downwardConnectionFromBottomPeak(bottomPeak);
                if (target !== undefined) {
                    // console.log("join", bottomPeak.id, [bottomPeak.x, bottomPeak.y], target.id, [target.x, target.y]);
                    this.joinNodes(bottomPeak, target);
                }
            }
        }
        if (downSweep) {
            // flip the whole graph (ouch)
            this.negateXY();
            // swap the various p and down seeds ....
            this.swapArrays();
            this.bottomPeaks.sort(Merging_1.HalfEdgeGraphOps.compareNodesYXUp);
            for (const bottomPeak of this.bottomPeaks) {
                if (!Merging_1.HalfEdgeGraphOps.isDownPeak(bottomPeak))
                    continue;
                const target = this.downwardConnectionFromBottomPeak(bottomPeak);
                if (target !== undefined) {
                    this.joinNodes(bottomPeak, target);
                }
            }
            this.negateXY();
            this.swapArrays();
        }
    }
    /**
     * Regularize a single face.
     * * Insert edge from any downward interior vertex to something lower
     * * Insert an edge from each upward interior vertex to something higher.
     * * The face is split into smaller faces
     * * Each final face has at most one "min" and one "max", and is easy to triangulate with a bottom to top sweep.
     * * Normal usage is to sweep in both directions, i.e. use the default (true,true) for the upSweep and downSweep parameters.
     * @param faceSeed any representative half edge on the face
     * @param upSweep true to do the upward sweep.
     * @param downSweep true to do the downward sweep.
     */
    regularizeFace(faceSeed, upSweep = true, downSweep = true) {
        this.collectVerticalEventsAroundFace(faceSeed);
        this.runRegularization(upSweep, downSweep);
    }
    regularizeGraph(upSweep = true, downSweep = true) {
        this.collectVerticalEventFromEdgesInAndArray(this.graph.allHalfEdges);
        this.runRegularization(upSweep, downSweep);
    }
    /** test if a single face is monotone;  if so, return its (single) min */
    static isMonotoneFace(seed) {
        let numMin = 0;
        let numMax = 0;
        let nodeMin;
        let nodeA = seed;
        do {
            const nodeB = nodeA.faceSuccessor;
            const nodeC = nodeB.faceSuccessor;
            const ab = Merging_1.HalfEdgeGraphOps.compareNodesYXUp(nodeA, nodeB);
            const bc = Merging_1.HalfEdgeGraphOps.compareNodesYXUp(nodeB, nodeC);
            if (ab * bc <= 0) {
                if (ab > 0) {
                    numMin++;
                    nodeMin = nodeB;
                }
                if (bc > 0) {
                    numMax++;
                }
            }
        } while ((nodeA = nodeA.faceSuccessor) !== seed);
        return numMin === 1 && numMax === 1 ? nodeMin : undefined;
    }
    /** Return faces filtered by area and test function.
     * * find one arbitrary representative of each face
     * * offer the candidate to the mutate function.
     * * collect results
     * @param mappedSeeds when filter returns a HalfEdge, collect it here
     * @param unmappedSeeds when filter does not return a half edge, collect the candidate.
     */
    static collectMappedFaceRepresentatives(graph, positiveAreaOnly, mutate, mappedEdges, unMappedSeeds) {
        if (mappedEdges)
            mappedEdges.length = 0;
        if (unMappedSeeds)
            unMappedSeeds.length = 0;
        const mask = Graph_1.HalfEdgeMask.VISITED;
        graph.clearMask(mask);
        for (const seed of graph.allHalfEdges) {
            if (!seed.getMask(mask)) {
                seed.setMaskAroundFace(mask);
                if (!positiveAreaOnly || seed.signedFaceArea() > 0) {
                    const edge = mutate(seed);
                    if (edge) {
                        if (mappedEdges)
                            mappedEdges.push(edge);
                    }
                    else {
                        if (unMappedSeeds)
                            unMappedSeeds.push(seed);
                    }
                }
            }
        }
    }
}
exports.RegularizationContext = RegularizationContext;
//# sourceMappingURL=RegularizeFace.js.map