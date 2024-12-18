/**
 * @license
 * Copyright 2022 Google Inc.
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Protocol } from 'devtools-protocol';
import type { CDPSession } from '../api/CDPSession.js';
import type { EventEmitter, EventType } from '../common/EventEmitter.js';
import type { CdpTarget } from './Target.js';
/**
 * @internal
 */
export type TargetFactory = (targetInfo: Protocol.Target.TargetInfo, session?: CDPSession, parentSession?: CDPSession) => CdpTarget;
/**
 * @internal
 */
export declare const enum TargetManagerEvent {
    TargetDiscovered = "targetDiscovered",
    TargetAvailable = "targetAvailable",
    TargetGone = "targetGone",
    /**
     * Emitted after a target has been initialized and whenever its URL changes.
     */
    TargetChanged = "targetChanged"
}
/**
 * @internal
 */
export interface TargetManagerEvents extends Record<EventType, unknown> {
    [TargetManagerEvent.TargetAvailable]: CdpTarget;
    [TargetManagerEvent.TargetDiscovered]: Protocol.Target.TargetInfo;
    [TargetManagerEvent.TargetGone]: CdpTarget;
    [TargetManagerEvent.TargetChanged]: {
        target: CdpTarget;
        wasInitialized: true;
        previousURL: string;
    };
}
/**
 * TargetManager encapsulates all interactions with CDP targets and is
 * responsible for coordinating the configuration of targets with the rest of
 * Puppeteer. Code outside of this class should not subscribe `Target.*` events
 * and only use the TargetManager events.
 *
 * There are two implementations: one for Chrome that uses CDP's auto-attach
 * mechanism and one for Firefox because Firefox does not support auto-attach.
 *
 * @internal
 */
export interface TargetManager extends EventEmitter<TargetManagerEvents> {
    getAvailableTargets(): ReadonlyMap<string, CdpTarget>;
    getChildTargets(target: CdpTarget): ReadonlySet<CdpTarget>;
    initialize(): Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=TargetManager.d.ts.map