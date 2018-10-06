/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
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
    /** Custom identifier of the component the event originates from (supplied as part of the component's properties). */
    id: string;
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
    /** Overrides the default class for the component if given. */
    className?: string;
    /** Additional styles applied to the component. */
    style?: CSSProperties;
}
