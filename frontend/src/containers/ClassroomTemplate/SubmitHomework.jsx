import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { pathImgFromIndex } from "../../utils/constants";
import {
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { actFetchHomeworkDetailList } from "../../redux/modules/Homework/action";
import {
  actSubmitHomework,
  actFetchSubmission,
  actDeleteSubmission,
  resetSubmitHomework,
  deleteSubmissionReset,
  resetSubmission,
} from "../../redux/modules/SubmitHomework/action";

import { useDispatch, useSelector } from "react-redux";
import Loading from "../../components/Loading";

function SubmitHomework() {
  const { homeworkId, classroomId } = useParams();
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [check, setCheck] = useState(false);
  const [submit, setSubmit] = useState(false);

  let userId = null;

  if (localStorage.getItem("User")) {
    userId = JSON.parse(localStorage.getItem("User")).user._id;
  }

  let className = null;
  if (localStorage.getItem("classInfo")) {
    className = JSON.parse(localStorage.getItem("classInfo")).name;
  }

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(actFetchHomeworkDetailList(homeworkId));
    dispatch(actFetchSubmission(homeworkId, userId));
    // eslint-disable-next-line
  }, []);

  const dataHomework = useSelector(
    (state) => state.homeworkDetailReducer?.data
  );
  const loadingHomework = useSelector(
    (state) => state.homeworkDetailReducer?.loading
  );
  const errHomework = useSelector((state) => state.homeworkDetailReducer?.err);

  const dataSubmitHomework = useSelector(
    (state) => state.submit_homeworkReducer?.data
  );
  const loadingSubmitHomework = useSelector(
    (state) => state.submit_homeworkReducer?.loading
  );
  const errSubmitHomework = useSelector(
    (state) => state.submit_homeworkReducer?.err
  );

  const dataSubmission = useSelector((state) => state.submissionReducer?.data);
  const loadingSubmission = useSelector(
    (state) => state.submissionReducer?.loading
  );

  const datadeleteSubmission = useSelector(
    (state) => state.submissionDeleteReducer?.data
  );
  const loadingdeleteSubmission = useSelector(
    (state) => state.submissionDeleteReducer?.loading
  );
  const errdeleteSubmission = useSelector(
    (state) => state.submissionDeleteReducer?.err
  );
  useEffect(() => {
    // it works exactly
    if (dataSubmitHomework) {
      console.log("Submission successful:", dataSubmitHomework);
      setGoogleDriveLink("");
      setCheck(false);
      setSubmit(false);
      dispatch(actFetchSubmission(homeworkId, userId));
      dispatch(resetSubmitHomework());
      dispatch(resetSubmission());
    }
    // eslint-disable-next-line
  }, [dataSubmitHomework]);

  // Debug submission errors
  useEffect(() => {
    if (errSubmitHomework) {
      console.log("Submission error:", errSubmitHomework);
    }
  }, [errSubmitHomework]);

  // Debug submission data
  useEffect(() => {
    if (dataSubmission) {
      console.log("Submission data received:", dataSubmission);
    }
  }, [dataSubmission]);

  // Debug homework data
  useEffect(() => {
    if (dataHomework) {
      console.log("Homework data in SubmitHomework:", dataHomework);
      console.log(
        "Homework attachedFiles:",
        dataHomework?.homework?.attachedFiles
      );
      console.log(
        "Homework fileAttributes:",
        dataHomework?.homework?.fileAttributes
      );
    }
  }, [dataHomework]);

  if (loadingHomework) {
    return <Loading />;
  }
  if (errHomework) {
    console.log(errHomework);
  }

  const validateGoogleDriveLink = (link) => {
    if (!link) return false;
    const googleDrivePattern =
      /^https:\/\/drive\.google\.com\/(file\/d\/|open\?id=|drive\/folders\/)/;
    const isValid = googleDrivePattern.test(link);
    console.log("Link validation:", {
      link: link.substring(0, 50) + "...",
      isValid,
    });
    return isValid;
  };

  function format2Digits(n) {
    return n < 10 ? "0" + n : n;
  }

  const convertDate = (date) => {
    date = new Date(date);
    let hours, minutes;
    hours = format2Digits(date.getHours());
    minutes = format2Digits(date.getMinutes());

    var dd = String(date.getDate()).padStart(2, "0");
    var mm = String(date.getMonth() + 1).padStart(2, "0");
    var yyyy = date.getFullYear();
    return " " + dd + "/" + mm + "/" + yyyy + " " + hours + ":" + minutes;
  };

  const convertOnlyDate = (date) => {
    date = new Date(date);
    var dd = String(date.getDate()).padStart(2, "0");
    var mm = String(date.getMonth() + 1).padStart(2, "0");
    var yyyy = date.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
  };

  const handleLinkChange = (e) => {
    setGoogleDriveLink(e.target.value);
  };

  const handleDeleteLink = () => {
    setGoogleDriveLink("");
    setSubmit(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmit(true);

    console.log("Submit attempt:", {
      googleDriveLink: googleDriveLink,
      linkTrimmed: googleDriveLink.trim(),
      linkValid: validateGoogleDriveLink(googleDriveLink),
      checkboxChecked: check,
      homeworkId: homeworkId,
    });

    if (!googleDriveLink.trim()) {
      console.log("Error: Empty Google Drive link");
      return;
    }

    if (!validateGoogleDriveLink(googleDriveLink)) {
      console.log("Error: Invalid Google Drive link");
      return;
    }

    if (!check) {
      console.log("Error: Checkbox not checked");
      return;
    }

    console.log("Dispatching submission...");
    dispatch(actSubmitHomework(homeworkId, googleDriveLink));
  };

  const renderLoadingSubmit = () => {
    if (loadingSubmitHomework) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      );
    }
  };
  const renderLoadingSubmisson = () => {
    if (loadingSubmission || loadingdeleteSubmission) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      );
    }
  };
  const renderErrorSubmit = () => {
    if (errSubmitHomework) {
      return (
        <Alert severity="error">
          {errSubmitHomework.response?.data.message}
        </Alert>
      );
    }
  };

  const renderErrorDeleteSubmission = () => {
    if (errdeleteSubmission) {
      return (
        <Alert severity="error">
          {errdeleteSubmission.response?.data.message}
        </Alert>
      );
    }
  };

  //console.log(dataHomework);
  const handleDeleteSubmission = (e) => {
    dispatch(actDeleteSubmission(homeworkId));
  };
  if (datadeleteSubmission) {
    dispatch(actFetchSubmission(homeworkId, userId));
    dispatch(deleteSubmissionReset());
  }

  return (
    <div className="submit-homework container">
      <div className="logo-class">
        <Link to={{ pathname: `/classroom/${classroomId}/stream` }}>
          <div className="classname">{className}</div>
        </Link>
      </div>
      <div className="content">
        <div className="homework-detail">
          <img
            src={pathImgFromIndex + "homework_icon.png"}
            alt="homework-icon"
            height="100"
          />
          <div className="detail">
            <h3 className="name">{dataHomework?.homework.title}</h3>
            <div className="sub-detail">
              <p>
                <span>Ngày đăng:</span>{" "}
                {convertOnlyDate(dataHomework?.homework.createdAt)}
              </p>
              <p>
                <span> Đến hạn:</span>{" "}
                {convertOnlyDate(dataHomework?.homework.deadline)}
              </p>
            </div>
            <p style={{ marginTop: 10 }}>
              {dataHomework?.homework.description}
            </p>

            {/* Display homework attachments for students */}
            {dataHomework?.homework.attachedFiles &&
              dataHomework?.homework.attachedFiles.length > 0 && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 15,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 8,
                    border: "1px solid #dee2e6",
                  }}
                >
                  <h5
                    style={{
                      margin: "0 0 10px 0",
                      color: "#495057",
                      fontSize: "16px",
                    }}
                  >
                    📁 Tài liệu bài tập
                  </h5>
                  <a
                    href={dataHomework?.homework.attachedFiles[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: "none",
                      color: "#1976d2",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      border: "1px solid #1976d2",
                      borderRadius: "4px",
                      backgroundColor: "#ffffff",
                      width: "fit-content",
                    }}
                  >
                    📄 Mở tài liệu Google Drive
                  </a>
                </div>
              )}
          </div>
        </div>
        <div className="submit">
          <div className="header" style={{ marginBottom: 10 }}>
            <span>Bài tập của bạn</span>
            {dataSubmission?.submission.markDone !== true ? (
              <span className="status incomplete">{"Chưa nộp bài"}</span>
            ) : (
              <span className="status complete">{"Đã nộp"}</span>
            )}
          </div>
          {renderLoadingSubmisson()}
          {renderErrorDeleteSubmission()}
          {dataSubmission?.submission.markDone ? (
            <div
              className="card"
              style={{
                width: "100%",
                borderRadius: 10,
                boxShadow:
                  "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                marginBottom: 20,
                marginTop: dataSubmission?.submission !== null ? 20 : 0,
              }}
            >
              <div className="card-body d-flex p-3 file-info">
                <img
                  src={pathImgFromIndex + "file.png"}
                  alt="file img"
                  height="100"
                  style={{ marginRight: 20, marginLeft: -20 }}
                />
                <div className="info-file-block" style={{ width: "80%" }}>
                  <div className="info d-flex justify-content-between">
                    <div
                      className="left"
                      style={{
                        width: "80%",
                      }}
                    >
                      <h5
                        className="card-title"
                        style={{
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {dataSubmission?.submission?.attachedFiles &&
                        dataSubmission?.submission?.attachedFiles[0] ? (
                          <a
                            href={dataSubmission?.submission?.attachedFiles[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              textDecoration: "none",
                              color: "#1976d2",
                            }}
                          >
                            Bài làm Google Drive
                          </a>
                        ) : (
                          "Google Drive Submission"
                        )}
                      </h5>

                      <h6 className="card-subtitle mb-2 text-muted">
                        Loại: Google Drive
                      </h6>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Kích thước: External Link
                      </h6>
                      <h6 className="card-subtitle mb-2 text-muted">
                        Nộp lần cuối:
                        {convertDate(dataSubmission?.submission?.updatedAt)}
                      </h6>
                    </div>
                    <button className="btn btn-delete-file">
                      <DeleteIcon
                        fontSize="large"
                        color="error"
                        onClick={handleDeleteSubmission}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4
                style={{
                  textAlign: "right",
                  fontWeight: "normal",
                  fontSize: 16,
                  margin: "10px 0",
                  lineHeight: "25px",
                }}
              >
                Nhập link Google Drive chia sẻ bài làm của bạn
              </h4>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Bài làm này do chính tôi thực hiện"
                  checked={check}
                  onClick={() => {
                    setCheck(!check);
                  }}
                />
                {submit === true && !check ? (
                  <span
                    className="warning text-danger"
                    style={{ fontSize: 16, fontWeight: "bold" }}
                  >
                    Bắt buộc phải đánh dấu phần này
                  </span>
                ) : (
                  ""
                )}
              </FormGroup>
              {renderLoadingSubmit()}
              {renderErrorSubmit()}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, my: 2 }}
              >
                <AttachFileIcon color="action" />
                <TextField
                  label="Link Google Drive"
                  value={googleDriveLink}
                  onChange={handleLinkChange}
                  fullWidth
                  placeholder="https://drive.google.com/file/d/..."
                  helperText="Nhập link chia sẻ Google Drive của bài làm"
                  error={
                    submit &&
                    (!googleDriveLink.trim() ||
                      (googleDriveLink.trim() &&
                        !validateGoogleDriveLink(googleDriveLink)))
                  }
                />
              </Box>

              {/* Show validation errors */}
              {submit && !googleDriveLink.trim() && (
                <Alert severity="error" sx={{ my: 1 }}>
                  Vui lòng nhập link Google Drive
                </Alert>
              )}

              {submit &&
                googleDriveLink.trim() &&
                !validateGoogleDriveLink(googleDriveLink) && (
                  <Alert severity="error" sx={{ my: 1 }}>
                    Link Google Drive không hợp lệ. Định dạng đúng:
                    https://drive.google.com/file/d/...
                  </Alert>
                )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!check || !googleDriveLink.trim()}
                sx={{ mt: 2 }}
                fullWidth
              >
                Nộp bài
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmitHomework;
