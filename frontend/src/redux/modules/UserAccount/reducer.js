import * as actionTypes from "./constants";

const changeAvatarState = {
  loading: false,
  data: null,
  err: null,
};

export const changeAvatarReducer = (
  state = changeAvatarState,
  { type, payload }
) => {
  switch (type) {
    case actionTypes.CHANGE_AVATAR_REQUEST: {
      state.loading = true;
      state.data = null;
      state.err = null;
      return { ...state };
    }
    case actionTypes.CHANGE_AVATAR_SUCCESS: {
      state.loading = false;
      state.data = payload;
      state.err = null;
      return { ...state };
    }
    case actionTypes.CHANGE_AVATAR_FAILED: {
      state.loading = false;
      state.data = null;
      state.err = payload;
      return { ...state };
    }
    case actionTypes.CHANGE_AVATAR_RESET: {
      return changeAvatarState;
    }
    default:
      return { ...state };
  }
};

const changeInformationState = {
  loading: false,
  data: null,
  err: null,
};

export const changeInformationReducer = (
  state = changeInformationState,
  { type, payload }
) => {
  switch (type) {
    case actionTypes.CHANGE_INFORMATION_REQUEST: {
      state.loading = true;
      state.data = null;
      state.err = null;
      return { ...state };
    }
    case actionTypes.CHANGE_INFORMATION_SUCCESS: {
      state.loading = false;
      state.data = payload;
      state.err = null;
      return { ...state };
    }
    case actionTypes.CHANGE_INFORMATION_FAILED: {
      state.loading = false;
      state.data = null;
      state.err = payload;
      return { ...state };
    }
    case actionTypes.CHANGE_INFORMATION_RESET: {
      return changeInformationState;
    }
    default:
      return { ...state };
  }
};
