// Copyright (c) Meta Platforms, Inc. and affiliates.
// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export type RNReliabilityEventListener = (event: ReactNativeChromeDevToolsEvent) => void;

type UnsunscribeFn = () => void;
export type RNPerfMetrics = {
  addEventListener: (listener: RNReliabilityEventListener) => UnsunscribeFn,
  removeAllEventListeners: () => void,
  sendEvent: (event: ReactNativeChromeDevToolsEvent) => void,
};

let instance: RNPerfMetrics|null = null;

export function getInstance(): RNPerfMetrics {
  if (instance === null) {
    instance = new RNPerfMetricsImpl();
  }
  return instance;
}

class RNPerfMetricsImpl implements RNPerfMetrics {
  #listeners: Set<RNReliabilityEventListener> = new Set();

  addEventListener(listener: RNReliabilityEventListener): () => void {
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

export type ReactNativeChromeDevToolsEvent = {};