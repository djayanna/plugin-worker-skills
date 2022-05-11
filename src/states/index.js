import { combineReducers } from 'redux';

import { reduce as WorkerSkillsStateReducer } from './WorkerSkillsState';

// Register your redux store under a unique namespace
export const namespace = 'worker-skills';

// Combine the reducers
export default combineReducers({
  workerSkills: WorkerSkillsStateReducer,
});
