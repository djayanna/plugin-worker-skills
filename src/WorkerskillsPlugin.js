import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import WorkerSkills from './components/WorkerSkills/WorkerSkills';

const PLUGIN_NAME = 'WorkerskillsPlugin';

export default class WorkerskillsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    this.registerReducers(manager);

    // flex.WorkerSkills.Content.replace(<WorkerSkills key="custom-worker-skills" />);

    flex.WorkerSkills.Content.add(<WorkerSkills key="custom-worker-skills" />, { sortOrder: 5 });
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    //manager.store.addReducer(namespace, reducers);
  }
}
