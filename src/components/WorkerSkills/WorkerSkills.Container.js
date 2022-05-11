import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Actions } from '../../states/WorkerSkillsState';
import WorkerSkills from './WorkerSkills';

const mapStateToProps = (state) => ({
  selected_worker: state['worker-skills'].workerSkills.worker,
});

const mapDispatchToProps = (dispatch) => ({
    updateWorkerAttributes: bindActionCreators(Actions.updateWorkerAttributes, dispatch),
    updateIsDirty: bindActionCreators(Actions.updateIsDirty, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkerSkills);