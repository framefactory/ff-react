/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";
import { IManipEventHandler, IManipPointerEvent, IManipTriggerEvent } from "./ManipTarget";

////////////////////////////////////////////////////////////////////////////////

type ManipMode = "off" | "pan" | "orbit" | "dolly" | "zoom" | "pan-dolly" | "roll";
type ManipPhase = "off" | "active" | "release";

export interface IDeltaOrbitPose
{
    dX: number;
    dY: number;
    dHead: number;
    dPitch: number;
    dScale: number;
}

export default class OrbitManip implements IManipEventHandler
{
    protected mode: ManipMode;
    protected phase: ManipPhase;
    protected prevEvent: IManipPointerEvent;
    protected prevPinchDist: number;

    protected deltaX: number;
    protected deltaY: number;
    protected deltaPinch: number;
    protected deltaWheel: number;

    protected deltaOrbit: IDeltaOrbitPose;

    constructor()
    {
        this.mode = "off";
        this.phase = "off";
        this.prevEvent = null;
        this.prevPinchDist = 0;

        this.deltaX = 0;
        this.deltaY = 0;
        this.deltaPinch = 0;
        this.deltaWheel = 0;

        this.deltaOrbit = {
            dX: 0,
            dY: 0,
            dHead: 0,
            dPitch: 0,
            dScale: 1
        };
    }

    getDeltaPose(): IDeltaOrbitPose
    {
        if (this.phase === "off" && this.deltaWheel === 0) {
            return null;
        }

        if (this.deltaWheel !== 0) {
            this.deltaOrbit.dScale = this.deltaWheel * 0.07 + 1;
            this.deltaWheel = 0;
        }

        if (this.phase === "active") {
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

    onPointer(event: IManipPointerEvent): boolean
    {
        if (event.isPrimary) {
            if (event.type === "down") {
                this.phase = "active";
            }
            else if (event.type === "up") {
                this.phase = "release";
                this.prevEvent = null;
                return true;
            }
            else if (event.downPointerCount === 0) {
                return false;
            }
        }

        let prevEvent = this.prevEvent;
        this.prevEvent = event;

        if (event.type === "up" || event.type === "down") {
            prevEvent = event;

            const mode = this.getModeFromEvent(event);
            if (mode !== this.mode && event.type === "down") {
                this.mode = mode;
            }
        }

        this.deltaX += (event.centerX - prevEvent.centerX);
        this.deltaY += (event.centerY - prevEvent.centerY);

        // calculate pinch
        if (event.activePointerCount === 2) {
            const activePointerList = event.activePointerList;
            const dx = activePointerList[1].clientX - activePointerList[0].clientX;
            const dy = activePointerList[1].clientY - activePointerList[0].clientY;
            const pinchDist = Math.sqrt(dx * dx + dy * dy);

            const prevPinchDist = this.prevPinchDist || pinchDist;
            this.deltaPinch = prevPinchDist > 0 ? (pinchDist / prevPinchDist) : 1;
            this.prevPinchDist = prevPinchDist;
        }
        else {
            this.deltaPinch = 1;
            this.prevPinchDist = 0;
        }

        return true;
    }

    onTrigger(event: IManipTriggerEvent): boolean
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
        delta.dHead = 0;
        delta.dPitch = 0;
        delta.dScale = 1;

        switch(this.mode) {
            case "orbit":
                delta.dHead = this.deltaX;
                delta.dPitch = this.deltaY;
                break;
            case "pan":
                delta.dX = this.deltaX;
                delta.dY = this.deltaY;
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

    protected getModeFromEvent(event: IManipPointerEvent): ManipMode
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
                return "pan";
            }

            // middle button
            if (button === 1) {
                return "dolly";
            }
        }
        else if (event.source === "touch") {

            const count = event.activePointerCount;

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
