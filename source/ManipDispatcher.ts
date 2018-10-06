/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { IManipEventHandler, IManipPointerEvent, IManipTriggerEvent } from "./ManipTarget";

////////////////////////////////////////////////////////////////////////////////

export default class ManipDispatcher implements IManipEventHandler
{
    protected handlers: IManipEventHandler[];
    protected activeHandler: IManipEventHandler;
    protected activeHandlerIndex: number;

    constructor()
    {
        this.handlers = [];
        this.activeHandler = null;
    }

    addManip(handler: IManipEventHandler)
    {
        this.handlers.push(handler);
    }

    insertManip(index: number, handler: IManipEventHandler)
    {
        this.handlers.splice(index, 0, handler);
    }

    removeManip(handler: IManipEventHandler)
    {
        const index = this.handlers.indexOf(handler);
        if (index >= 0) {
            this.handlers.splice(index, 1);
        }
    }

    onPointer(event: IManipPointerEvent): boolean
    {
        let consumed = false;

        if (this.activeHandler) {
            consumed = this.activeHandler.onPointer(event);

            if (!consumed) {
                this.activeHandler = null;
            }
        }
        else {
            for (let i = 0; i < this.handlers.length; ++i) {
                const handler = this.handlers[i];
                consumed = handler.onPointer(event);
                if (consumed) {
                    this.activeHandler = handler;
                    this.activeHandlerIndex = i;
                    break;
                }
            }
        }

        return consumed;
    }

    onTrigger(event: IManipTriggerEvent): boolean
    {
        let consumed = false;

        if (this.activeHandler) {
            consumed = this.activeHandler.onTrigger(event);
        }
        else {
            for (let i = 0; i < this.handlers.length; ++i) {
                const handler = this.handlers[i];
                consumed = handler.onTrigger(event);
                if (consumed) {
                    break;
                }
            }
        }

        return consumed;
    }
}
