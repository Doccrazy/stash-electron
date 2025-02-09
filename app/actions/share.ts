import { clipboard } from 'electron';
import EntryPtr from '../domain/EntryPtr';
import { shareOnPrivateBin } from '../utils/privateBin';
import { withEntryOrCurrent } from './currentEntry';
import { OptionalAction, TypedAction, TypedThunk } from './types/index';
import { ShareFormState, State } from './types/share';

export enum Actions {
  PREPARE_SHARE = 'share/PREPARE_SHARE',
  CANCEL_SHARE = 'share/CANCEL_SHARE',
  CHANGE_SHARE_SETTINGS = 'share/CHANGE_SHARE_SETTINGS',
  SHARE_SUCCESS = 'share/SHARE_SUCCESS'
}

export function prepareShare(ptr?: EntryPtr): Thunk<void> {
  return (dispatch, getState) => {
    const { currentEntry } = getState();
    ptr = ptr || currentEntry.ptr;
    if (ptr) {
      dispatch({
        type: Actions.PREPARE_SHARE,
        payload: ptr
      });
    }
  };
}

export function sharePrivateBin(ptr?: EntryPtr): Thunk<Promise<void>> {
  return withEntryOrCurrent(ptr, async (type, content, entryPtr, dispatch, getState) => {
    const { privateBinSite } = getState().settings.current;
    if (!type.toPlainText) {
      return;
    }
    const value = type.toPlainText(type.toDisplayName(entryPtr.entry), content);
    if (value) {
      const pasteUrl = await shareOnPrivateBin(privateBinSite, value, {
        expire: getState().share.formState.expire,
        burnafterreading: getState().share.formState.burnAfterReading ? 1 : 0
      });
      dispatch(shareSuccess(pasteUrl));
      dispatch(copyPasteUrl());
    }
  });
}

function shareSuccess(url: string): Action {
  return {
    type: Actions.SHARE_SUCCESS,
    payload: url
  };
}

export function copyPasteUrl(): Thunk<void> {
  return (dispatch, getState) => {
    if (getState().share.pasteUrl) {
      clipboard.writeText(getState().share.pasteUrl!);
    }
  };
}

export function closeShare(): Action {
  return {
    type: Actions.CANCEL_SHARE
  };
}

export function changeShareSettings(settings: ShareFormState): Action {
  return {
    type: Actions.CHANGE_SHARE_SETTINGS,
    payload: settings
  };
}

type Action =
  | OptionalAction<Actions.PREPARE_SHARE, EntryPtr>
  | OptionalAction<Actions.CANCEL_SHARE>
  | TypedAction<Actions.CHANGE_SHARE_SETTINGS, ShareFormState>
  | TypedAction<Actions.SHARE_SUCCESS, string>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { formState: { expire: '10min', burnAfterReading: false } }, action: Action): State {
  switch (action.type) {
    case Actions.PREPARE_SHARE:
      return { ...state, sharing: action.payload };
    case Actions.CANCEL_SHARE:
      return { ...state, sharing: undefined, pasteUrl: undefined };
    case Actions.CHANGE_SHARE_SETTINGS:
      return { ...state, formState: action.payload };
    case Actions.SHARE_SUCCESS:
      return { ...state, pasteUrl: action.payload };
    default:
      return state;
  }
}
