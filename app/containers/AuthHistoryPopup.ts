import { Set } from 'immutable';
import { connect } from 'react-redux';
import { Dispatch, RootState } from '../actions/types';
import { close, setFilter } from '../actions/usersHistory';
import AuthHistoryPopup from '../components/AuthHistoryPopup';
import { formatPath } from '../utils/format';
import { hierarchy } from '../utils/repository';

export default connect(
  (state: RootState) => {
    return {
      open: state.usersHistory.authOpen,
      nodePath: state.usersHistory.authNodeId
        ? hierarchy(state.repository.nodes, state.usersHistory.authNodeId).map((n) => n.name)
        : undefined,
      history: state.usersHistory.authOpen
        ? state.usersHistory.authHistory
            .filter((he) => !state.usersHistory.filterNodeId || he.nodeId === state.usersHistory.filterNodeId)
            .map((he) => ({ ...he, path: hierarchy(state.repository.nodes, he.nodeId).map((n) => n.name) }))
        : [],
      filterOptions: Set(state.usersHistory.authHistory.map((he) => he.nodeId))
        .map((nodeId) => ({ nodeId, title: formatPath(hierarchy(state.repository.nodes, nodeId).map((n) => n.name)) }))
        .sortBy((o) => o.title.toLowerCase())
        .toArray(),
      filterNodeId: state.usersHistory.filterNodeId
    };
  },
  (dispatch: Dispatch) => ({
    onFilter: (nodeId?: string) => dispatch(setFilter(nodeId)),
    onClose: () => dispatch(close())
  })
)(AuthHistoryPopup);
