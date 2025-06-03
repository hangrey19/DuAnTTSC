import axios from "axios";
import { pathAPI } from "../../../utils/constants";
import * as actionTypes from "./constants";

// action Fetch All Task
export const changeAvatar = (avatar) => {
  let accessToken = "";
  if (localStorage.getItem("User"))
    accessToken = JSON.parse(localStorage.getItem("User")).token;
  let formData = new FormData();
  formData.append("avatar", avatar);

  return (dispatch) => {
    dispatch(changeAvatarRequest());
    axios({
      url: pathAPI + `user/changeAvatar`,
      method: "POST",
      data: formData,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((res) => {
        dispatch(changeAvatarSuccess(res.data));
      })
      .catch((err) => {
        dispatch(changeAvatarFailed(err));
      });
  };
};
export const resetAvatar = () => {
  return (dispatch) => {
    dispatch(changeAvatarReset());
  };
};
const changeAvatarRequest = () => {
  return {
    type: actionTypes.CHANGE_AVATAR_REQUEST,
  };
};

const changeAvatarSuccess = (data) => {
  return {
    type: actionTypes.CHANGE_AVATAR_SUCCESS,
    payload: data,
  };
};

const changeAvatarFailed = (err) => {
  return {
    type: actionTypes.CHANGE_AVATAR_FAILED,
    payload: err,
  };
};

const changeAvatarReset = () => {
  return {
    type: actionTypes.CHANGE_AVATAR_RESET,
  };
};

// action Change User Information
export const changeInformation = (data) => {
  let accessToken = "";
  if (localStorage.getItem("User"))
    accessToken = JSON.parse(localStorage.getItem("User")).token;

  return (dispatch) => {
    dispatch(changeInformationRequest());
    axios({
      url: pathAPI + "user/changeInformation",
      method: "POST",
      data: data,
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((res) => {
        dispatch(changeInformationSuccess(res.data));
      })
      .catch((err) => {
        dispatch(changeInformationFailed(err));
      });
  };
};

export const resetChangeInformation = () => {
  return (dispatch) => {
    dispatch(changeInformationReset());
  };
};

const changeInformationRequest = () => {
  return {
    type: actionTypes.CHANGE_INFORMATION_REQUEST,
  };
};

const changeInformationSuccess = (data) => {
  return {
    type: actionTypes.CHANGE_INFORMATION_SUCCESS,
    payload: data,
  };
};

const changeInformationFailed = (err) => {
  return {
    type: actionTypes.CHANGE_INFORMATION_FAILED,
    payload: err,
  };
};

const changeInformationReset = () => {
  return {
    type: actionTypes.CHANGE_INFORMATION_RESET,
  };
};
