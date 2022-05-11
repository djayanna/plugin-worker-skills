import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';
import BulkSkills from './components/BulkWorkerSkills/BulkWorkerSkills';
import DisplayWorkerSkills from './components/DisplayWorkerSkills/DisplayWorkerSkills';
import WorkerSkills from './components/WorkerSkills/WorkerSkills.Container';
import reducers, { namespace } from "./states";

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

    if(!this.showEditableWorkerSkills(manager)) {
      flex.WorkerSkills.Content.replace(<DisplayWorkerSkills key="skills" />);
    } else {
      flex.WorkerSkills.Content.replace(<WorkerSkills key="custom-worker-skills" />);
      flex.WorkerCanvas.Content.add(<BulkSkills key="bulk-skills" />);
    }
  }

  showEditableWorkerSkills(manager)
  {
      const { roles } = manager.user;
      return roles.indexOf("supervisor") >= 0 || roles.indexOf("admin") >= 0;
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

    manager.store.addReducer(namespace, reducers);
  }
}
