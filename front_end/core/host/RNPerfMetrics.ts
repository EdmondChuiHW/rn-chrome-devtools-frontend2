// Copyright (c) Meta Platforms, Inc. and affiliates.
// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export type RNReliabilityEventListener = (event: ReactNativeChromeDevToolsEvent) => void;

let instance: RNPerfMetrics|null = null;

export function getInstance(): RNPerfMetrics {
  if (instance === null) {
    instance = new RNPerfMetrics();
  }
  return instance;
}

function getPerfTimestamp(): DOMHighResTimeStamp {
  return performance.timeOrigin + performance.now();
}

type UnsunscribeFn = () => void;
class RNPerfMetrics {
  #listeners: Set<RNReliabilityEventListener> = new Set();

  addEventListener(listener: RNReliabilityEventListener): UnsunscribeFn {
    this.#listeners.add(listener);

    const unsubscribe = (): void => {
      this.#listeners.delete(listener);
    };

    return unsubscribe;
  }

  removeAllEventListeners(): void {
    this.#listeners.clear();
  }

  sendEvent(event: ReactNativeChromeDevToolsEvent): void {
    if (globalThis.enableReactNativePerfMetrics !== true) {
      return;
    }

    const errors = [];
    for (const listener of this.#listeners) {
      try {
        listener(event);
      } catch (e) {
        errors.push(e);
      }
    }

    if (errors.length > 0) {
      const error = new AggregateError(errors);
      console.error('Error occurred when calling event listeners', error);
    }
  }

  setBreakpointRequest(params: SetBreakpointRequestEvent['params']): void {
    this.sendEvent({
      eventName: 'Debugger.SetBreakpoint.Request',
      timestamp: getPerfTimestamp(),
      params,
    });
  }

  setBreakpointResponse(params: SetBreakpointResponseEvent['params']): void {
    this.sendEvent({
      eventName: 'Debugger.SetBreakpoint.Response',
      timestamp: getPerfTimestamp(),
      params,
    });
  }

  breakpointResolved(params: BreakpointResolvedEvent['params']): void {
    this.sendEvent({
      eventName: 'Debugger.BreakpointResolved',
      timestamp: getPerfTimestamp(),
      params,
    });
  }

  debuggerPaused(params: DebuggerPausedEvent['params']): void {
    this.sendEvent({
      eventName: 'Debugger.Paused',
      timestamp: getPerfTimestamp(),
      params,
    });
  }
}

export function registerPerfMetricsGlobalPostMessageHandler(): void {
  if (globalThis.enableReactNativePerfMetrics !== true ||
      globalThis.enableReactNativePerfMetricsGlobalPostMessage !== true) {
    return;
  }

  getInstance().addEventListener(event => {
    window.postMessage({event, tag: 'react-native-chrome-devtools-perf-metrics'}, window.location.origin);
  });
}

export type SetBreakpointEventEntryPoint =|'fileGutterClicked'|'savedStateRestored';
export type SetBreakpointEventType =|'logpoint'|'unconditionalBreakpoint'|'conditionalBreakpoint';

export type BreakpointLocation = Readonly<{
  scriptId: string,
  lineNumber: number,
  columnNumber: number,
}>;

export type SetBreakpointRequestEvent = Readonly<{
  eventName: 'Debugger.SetBreakpoint.Request',
  timestamp: DOMHighResTimeStamp,
  params: Readonly<{
    entryPoint: SetBreakpointEventEntryPoint,
    requestID: string,
    type: SetBreakpointEventType,
    requestedLocation: BreakpointLocation,
  }>,
}>;

export type SetBreakpointResponseEvent = Readonly<{
  eventName: 'Debugger.SetBreakpoint.Response',
  timestamp: DOMHighResTimeStamp,
  params: Readonly<{
    breakpointID: string,
    requestID: string,
    actualLocation: BreakpointLocation,
  }>,
}>;

export type BreakpointResolvedEvent = Readonly<{
  eventName: 'Debugger.BreakpointResolved',
  timestamp: DOMHighResTimeStamp,
  params: Readonly<{
    breakpointID: string,
    actualLocation: BreakpointLocation,
  }>,
}>;

export type DebuggerPausedEvent = Readonly<{
  eventName: 'Debugger.Paused',
  timestamp: DOMHighResTimeStamp,
  params: Readonly<{
    hitBreakpointIDs: Readonly<string[]>| null | void,
    location: BreakpointLocation,
  }>,
}>;

type ReactNativeChromeDevToolsEvent =
    |SetBreakpointRequestEvent|SetBreakpointResponseEvent|BreakpointResolvedEvent|DebuggerPausedEvent;
