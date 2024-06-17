// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';

import type * as Freestyler from './freestyler.js';

const UIStrings = {
  /**
   * @description The title of the action for showing Freestyler panel.
   */
  showFreestyler: 'Show Freestyler',
  /**
   * @description The title of the Freestyler panel.
   */
  freestyler: 'Freestyler',
};

/*
  * TODO(nvitkov): b/346933425
  * Temporary string that should not be translated
  * as they may change often during development.
  */
const TempUIStrings = {
  /**
   * @description The setting title to enable the freestyler via
   * the settings tab.
   */
  enableFreestyler: 'Enable Freestyler',
  /**
   *@description Text of a tooltip to redirect to the AI assistant panel with
   *the current element as context
   */
  askFreestyler: 'Ask Freestyler',
};

const str_ = i18n.i18n.registerUIStrings('panels/freestyler/freestyler-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);

const setting = 'freestyler-enabled';

let loadedFreestylerModule: (typeof Freestyler|undefined);
async function loadFreestylerModule(): Promise<typeof Freestyler> {
  if (!loadedFreestylerModule) {
    loadedFreestylerModule = await import('./freestyler.js');
  }
  return loadedFreestylerModule;
}

function isFeatureAvailable(config?: Root.Runtime.HostConfig): boolean {
  // Remove query param check once HostConfig is available.
  return Root.Runtime.Runtime.queryParam('freestyler_dogfood') === 'true' ||
      config?.devToolsFreestylerDogfood?.enabled === true;
}

UI.ViewManager.registerViewExtension({
  location: UI.ViewManager.ViewLocationValues.DRAWER_VIEW,
  id: 'freestyler',
  commandPrompt: i18nLazyString(UIStrings.showFreestyler),
  title: i18nLazyString(UIStrings.freestyler),
  order: 10,
  persistence: UI.ViewManager.ViewPersistence.CLOSEABLE,
  hasToolbar: false,
  condition: isFeatureAvailable,
  async loadView() {
    const Freestyler = await loadFreestylerModule();
    return Freestyler.FreestylerPanel.instance();
  },
});

Common.Settings.registerSettingExtension({
  category: Common.Settings.SettingCategory.GLOBAL,
  settingName: setting,
  settingType: Common.Settings.SettingType.BOOLEAN,
  title: i18n.i18n.lockedLazyString(TempUIStrings.enableFreestyler),
  defaultValue: isFeatureAvailable,
  reloadRequired: true,
  condition: isFeatureAvailable,
});

UI.ActionRegistration.registerActionExtension({
  actionId: 'freestyler.element-panel-context',
  contextTypes(): [] {
    return [];
  },
  setting,
  category: UI.ActionRegistration.ActionCategory.GLOBAL,
  title: i18n.i18n.lockedLazyString(TempUIStrings.askFreestyler),
  async loadActionDelegate() {
    const Freestyler = await loadFreestylerModule();
    return new Freestyler.ActionDelegate();
  },
  condition: isFeatureAvailable,
});

UI.ActionRegistration.registerActionExtension({
  actionId: 'freestyler.style-tab-context',
  contextTypes(): [] {
    return [];
  },
  setting,
  category: UI.ActionRegistration.ActionCategory.GLOBAL,
  title: i18n.i18n.lockedLazyString(TempUIStrings.askFreestyler),
  iconClass: UI.ActionRegistration.IconClass.SPARK,
  async loadActionDelegate() {
    const Freestyler = await loadFreestylerModule();
    return new Freestyler.ActionDelegate();
  },
  condition: isFeatureAvailable,
});
