/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";
import { IManipEventHandler, IPointerEvent, ITriggerEvent } from "./ManipTarget";
import { PointerEventSource, PointerEventType, TriggerEventType } from "@ff/browser/ManipTarget";

////////////////////////////////////////////////////////////////////////////////

type ManipMode = "off" | "pan" | "orbit" | "dolly" | "zoom" | "pan-dolly" | "roll";
type ManipPhase = "off" | "active" | "release";

export interface IDeltaOrbitManip
{
    dX: number;
    dY: number;
    dScale: number;
    dPitch: number;
    dHead: number;
    dRoll: number;
}

export default class OrbitManip implements IManipEventHandler
{
    protected mode: ManipMode;
    protected phase: ManipPhase;
    protected prevPinchDist: number;

    protected deltaX: number;
    protected deltaY: number;
    protected deltaPinch: number;
    protected deltaWheel: number;

    protected deltaOrbit: IDeltaOrbitManip;

    constructor()
    {
        this.mode = "off";
        this.phase = "off";
        this.prevPinchDist = 0;

        this.deltaX = 0;
        this.deltaY = 0;
        this.deltaPinch = 0;
        this.deltaWheel = 0;

        this.deltaOrbit = {
            dX: 0,
            dY: 0,
            dScale: 1,
            dHead: 0,
            dPitch: 0,
            dRoll: 0
        };
    }

    getDeltaPose(): IDeltaOrbitManip
    {
        if (this.phase === "off" && this.deltaWheel === 0) {
            return null;
        }

        if (this.deltaWheel !== 0) {
            this.deltaOrbit.dScale = this.deltaWheel * 0.07 + 1;
            this.deltaWheel = 0;
        }

        if (this.phase === "active") {
            if (this.deltaX === 0 && this.deltaY === 0 && this.deltaPinch === 1) {
                return null;
            }
            this.setDeltaOrbit();
            this.deltaX = 0;
            this.deltaY = 0;
            this.deltaPinch = 1;
        }
        else if (this.phase === "release") {
            this.deltaX *= 0.85;
            this.deltaY *= 0.85;
            this.deltaPinch = 1;
            this.setDeltaOrbit();

            const delta = Math.abs(this.deltaX) + Math.abs(this.deltaY);
            if (delta < 0.1) {
                this.mode = "off";
                this.phase = "off";
            }
        }

        return this.deltaOrbit;
    }

    onPointer(event: IPointerEvent): boolean
    {
        if (event.isPrimary) {
            if (event.type === "pointer-down") {
                this.phase = "active";
            }
            else if (event.type === "pointer-up") {
                this.phase = "release";
                return true;
            }
        }

        if (event.type === "pointer-down") {
            this.mode = this.getModeFromEvent(event);
        }

        this.deltaX += event.movementX;
        this.deltaY += event.movementY;

        // calculate pinch
        if (event.pointerCount === 2) {
            const positions = event.activePositions;
            const dx = positions[1].clientX - positions[0].clientX;
            const dy = positions[1].clientY - positions[0].clientY;
            const pinchDist = Math.sqrt(dx * dx + dy * dy);

            const prevPinchDist = this.prevPinchDist || pinchDist;
            this.deltaPinch *= prevPinchDist > 0 ? (pinchDist / prevPinchDist) : 1;
            this.prevPinchDist = pinchDist;
        }
        else {
            this.deltaPinch = 1;
            this.prevPinchDist = 0;
        }

        return true;
    }

    onTrigger(event: ITriggerEvent): boolean
    {
        if (event.type === "wheel") {
            this.deltaWheel += math.limit(event.wheel, -1, 1);
            return true;
        }

        return false;
    }

    protected setDeltaOrbit()
    {
        const delta = this.deltaOrbit;
        delta.dX = 0;
        delta.dY = 0;
        delta.dScale = 1;
        delta.dHead = 0;
        delta.dPitch = 0;
        delta.dRoll = 0;

        switch(this.mode) {
            case "orbit":
                delta.dHead = this.deltaX;
                delta.dPitch = this.deltaY;
                break;

            case "pan":
                delta.dX = this.deltaX;
                delta.dY = this.deltaY;
                break;

            case "roll":
                delta.dRoll = this.deltaX;
                break;

            case "dolly":
                delta.dScale = this.deltaY * 0.0075 + 1;
                break;

            case "pan-dolly":
                delta.dX = this.deltaX;
                delta.dY = this.deltaY;
                const pinchScale = (this.deltaPinch - 1) * 0.5 + 1;
                delta.dScale = 1 / pinchScale;
                break;
        }
    }

    protected getModeFromEvent(event: IPointerEvent): ManipMode
    {
        if (event.source === "mouse") {
            const button = event.originalEvent.button;

            // left button
            if (button === 0) {
                if (event.ctrlKey) {
                    return "pan";
                }
                if (event.altKey) {
                    return "dolly";
                }

                return "orbit";
            }

            // right button
            if (button === 2) {
                if (event.altKey) {
                    return "roll";
                }
                else {
                    return "pan";
                }
            }

            // middle button
            if (button === 1) {
                return "dolly";
            }
        }
        else if (event.source === "touch") {
            const count = event.pointerCount;

            if (count === 1) {
                return "orbit";
            }

            if (count === 2) {
                return "pan-dolly";
            }

            return "pan";
        }
    }
}
