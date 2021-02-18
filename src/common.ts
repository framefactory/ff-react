/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { CSSProperties } from "react";

////////////////////////////////////////////////////////////////////////////////

/**
 * Base event interface for React components.
 */
export interface IComponentEvent<T>
{
    /** Custom identifier of the component the event originates from. */
    id: string;
    /** Custom numeric index of the component the event originates from. */
    index: number;
    /** The component the event originates from. */
    sender: T;
}

/**
 * Base interface for React component properties.
 */
export interface IComponentProps
{
    /** Custom identifier for the component. */
    id?: string;
    /** Custom numeric index for the component. */
    index?: number;
    /** Overrides the default class for the component if given. */
    className?: string;
    /** Additional styles applied to the component. */
    style?: CSSProperties;
}
