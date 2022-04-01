const ACTION_UPDATE_WORKER_ATTRIBUTES = 'UPDATE_WORKER_ATTRIBUTES';
const ACTION_UPDATE_IS_DIRTY = 'UPDATE_IS_DIRTY';

const initialState = {
  selectedWorkerAttributes: undefined,
  isDirty: false
};

export class Actions {
  static updateWorkerAttributes = (workerAttributes, isDirty) => ({ type: ACTION_UPDATE_WORKER_ATTRIBUTES, workerAttributes, isDirty });
  static updateIsDirty = (isDirty) => ({ type: ACTION_UPDATE_IS_DIRTY, isDirty });
}

export function reduce(state = initialState, action) {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (action.type) {
    case ACTION_UPDATE_WORKER_ATTRIBUTES: {
      return {
        ...state,
        selectedWorkerAttributes: action.workerAttributes,
        isDirty: false
      };
    }
    case ACTION_UPDATE_IS_DIRTY: {
        return {
          ...state,
          isDirty: action.isDirty,
        };
      }

    default:
      return state;
  }
}
