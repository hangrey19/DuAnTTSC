import React, { useEffect } from "react";
import { Button, Box, TextField, Typography, Stack } from "@mui/material";
import TitleIcon from "@mui/icons-material/Title";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { useDispatch, useSelector } from "react-redux";
import { pathImgFromIndex } from "../utils/constants";
import { Link, useParams } from "react-router-dom";
import { actFetchHomeworkDetailList } from "../redux/modules/Homework/action";
import Loading from "./Loading";
import MobileDateTimePicker from "@mui/lab/MobileDateTimePicker";
import { useNavigate } from "react-router-dom";

function HomeworkInfo() {
  const classInfo = JSON.parse(localStorage.getItem("classInfo"));
  const { homeworkId, classroomId } = useParams();

  const history = useNavigate();
  const dispatch = useDispatch();

  const data = useSelector((state) => state.homeworkDetailReducer.data);
  const loading = useSelector((state) => state.homeworkDetailReducer.loading);
  const err = useSelector((state) => state.homeworkDetailReducer.err);

  useEffect(() => {
    dispatch(actFetchHomeworkDetailList(homeworkId));
    // eslint-disable-next-line
  }, []);

  // Debug logging
  useEffect(() => {
    if (data) {
      console.log("Homework data received:", data);
      console.log("Homework object:", data.homework);
      console.log("AttachedFiles:", data.homework?.attachedFiles);
      console.log("FileAttributes:", data.homework?.fileAttributes);
    }
  }, [data]);

  const format2Digits = (n) => {
    return n < 10 ? "0" + n : n;
  };

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

  if (loading) {
    return <Loading />;
  }

  if (err) {
    console.log(err);
  }

  return (
    <section className="homework-info">
      <div className="header">
        <Link
          to={{ pathname: `/classroom/${classroomId}/stream` }}
          style={{ textDecoration: "none" }}
        >
          <div className="classroom-name">{classInfo.name}</div>
        </Link>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="error"
            className="btn-add"
            onClick={() => history(`/classroom/${classroomId}/homework`)}
          >
            Quay về
          </Button>
        </Stack>
      </div>

      {/* <Box className="box-notice">{renderNotice()}</Box> */}

      <Box className="content" component="form" noValidate>
        <div className="row">
          <div className="col-md-9 left">
            <Box className="input-box">
              <TitleIcon
                fontSize="large"
                color="action"
                className="icon-input"
              />
              <TextField
                variant="filled"
                // inputRef={inputName}
                margin="normal"
                required
                fullWidth
                id="title"
                label="Tiêu đề"
                type="text"
                name="title"
                autoComplete="off"
                defaultValue={data?.homework?.title}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            <Box className="input-box">
              <DescriptionIcon
                fontSize="large"
                color="action"
                className="icon-input"
              />
              <TextField
                variant="filled"
                // inputRef={inputName}
                margin="normal"
                // required
                fullWidth
                id="description"
                label="Mô tả nội dung"
                type="text"
                name="description"
                autoComplete="off"
                multiline
                defaultValue={data?.homework?.description}
                minRows={5}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            <Box
              className="input-box"
              style={{ alignItems: "flex-start", marginTop: "1rem" }}
            >
              <AttachFileIcon
                fontSize="large"
                color="action"
                className="icon-input"
              />
              {!data?.homework.attachedFiles ||
              data?.homework.attachedFiles.length === 0 ? (
                <div
                  className="drop-zone"
                  style={{
                    border: "2px solid #bbb",
                    minHeight: 50,
                    padding: "10px",
                    borderRadius: 5,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <div style={{ color: "#666", fontStyle: "italic" }}>
                    Bài tập này không có file đính kèm
                  </div>
                  {/* Debug info */}
                  {data?.homework && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        marginTop: "5px",
                      }}
                    >
                      Debug: attachedFiles ={" "}
                      {JSON.stringify(data.homework.attachedFiles)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="files">
                  <div
                    className="card"
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      boxShadow:
                        "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
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
                          <div>
                            <h5
                              className="card-title"
                              style={{
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                              }}
                            >
                              <a
                                href={data?.homework?.attachedFiles[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  textDecoration: "none",
                                  color: "#1976d2",
                                  fontWeight: "bold",
                                }}
                              >
                                📁 Tài liệu bài tập (Google Drive)
                              </a>
                            </h5>
                            <h6 className="card-subtitle mb-2 text-muted">
                              Kích thước: External Link
                            </h6>
                            <h6 className="card-subtitle mb-2 text-muted">
                              Loại: Google Drive
                            </h6>
                            <h6 className="card-subtitle mb-2 text-muted">
                              Đăng tải: {convertDate(data?.homework?.createdAt)}
                            </h6>
                            {/* Debug info */}
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#999",
                                marginTop: "5px",
                              }}
                            >
                              Debug: Link = {data?.homework?.attachedFiles[0]}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Box>
          </div>

          <div className="col-md-3 right">
            <Box sx={{ pb: 2 }}>
              <Typography className="input-label">Điểm</Typography>
              <TextField
                variant="outlined"
                id="grade"
                name="grade"
                type="number"
                label="-"
                fullWidth
                defaultValue="10"
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
            <Box sx={{ pb: 2 }}>
              <Typography className="input-label">Hạn nộp</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MobileDateTimePicker
                  label="-"
                  fullWidth
                  renderInput={(props) => <TextField {...props} />}
                  inputFormat="dd/MM/yyyy hh:mm a"
                  mask="_/__/____ __:__ _M"
                  value={data?.homework?.deadline}
                  readOnly={false}
                  open={false}
                />
              </LocalizationProvider>
            </Box>
            <Box sx={{ pb: 2 }}>
              <Typography className="input-label">Chủ đề</Typography>
              <TextField
                variant="outlined"
                id="topic"
                name="topic"
                label="-"
                fullWidth
                defaultValue={data?.homework?.topic}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
          </div>
        </div>
      </Box>
    </section>
  );
}

export default HomeworkInfo;
