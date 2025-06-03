import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  TextField,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import TitleIcon from "@mui/icons-material/Title";
import DescriptionIcon from "@mui/icons-material/Description";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useDispatch, useSelector } from "react-redux";
import CreatableSelect from "react-select/creatable";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  createDocument,
  resetCreateDocument,
} from "../../redux/modules/Homework/action";
import {
  fetchUserInfo,
  fetchClassroomInfo,
} from "../../redux/modules/Home/action";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";

function UploadDocument() {
  const classInfoString = localStorage.getItem("classInfo");
  const classInfo = classInfoString ? JSON.parse(classInfoString) : null;
  const { classroomId } = useParams();

  const history = useNavigate();
  const dispatch = useDispatch();
  const [render, setRender] = useState(false);

  const data = useSelector((state) => state.createDocumentReducer.data);
  const loading = useSelector((state) => state.createDocumentReducer.loading);
  const err = useSelector((state) => state.createDocumentReducer.err);

  // User data for permission check
  const userData = useSelector((state) => state.fetchUserInfoReducer.data);
  const userLoading = useSelector(
    (state) => state.fetchUserInfoReducer.loading
  );

  // Classroom data
  const classroomData = useSelector(
    (state) => state.fetchClassroomInfoReducer.data
  );
  const classroomLoading = useSelector(
    (state) => state.fetchClassroomInfoReducer.loading
  );

  const [state, setState] = useState({
    title: "",
    description: "",
    googleDriveLink: "",
    topic: "Không có chủ đề",
  });

  useEffect(() => {
    // Only reset state when component first mounts, not on every render
    // setState({
    //   title: "",
    //   description: "",
    //   googleDriveLink: "",
    //   topic: "Không có chủ đề",
    // });

    // Fetch user data if not available
    if (!userData) {
      dispatch(fetchUserInfo());
    }

    // Fetch classroom data if not available in localStorage
    if (!classInfo) {
      dispatch(fetchClassroomInfo(classroomId));
    }
    // eslint-disable-next-line
  }, [userData, classInfo, classroomId]);

  const [emptyTitleNotice, setEmptyTitleNotice] = useState(false);
  // const [emptyDeadlineNotice, setEmptyDeadlineNotice] = useState(false);
  const [emptyTopicNotice, setEmptyTopicNotice] = useState(false);
  const [emptyFieldNotice, setEmptyFieldNotice] = useState(false);
  const [invalidLinkNotice, setInvalidLinkNotice] = useState(false);

  const rawTopic = useSelector((state) => state.documentReducer.data);
  let allTopics = [];

  if (rawTopic) {
    allTopics = rawTopic.map((item) => {
      return {
        value: item.topic,
        label: item.topic,
      };
    });
  }

  let idx = allTopics.findIndex((item) => item.value === "Không có chủ đề");
  if (idx === -1)
    allTopics.unshift({ value: "Không có chủ đề", label: "Không có chủ đề" });
  else
    allTopics.sort(function (x, y) {
      return x.value === "Không có chủ đề"
        ? -1
        : y.value === "Không có chủ đề"
        ? 1
        : 0;
    });

  // console.log("allTopics: ", allTopics);

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

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleTopicChange = (field) => {
    // console.log("topic", field);
    if (field === null) {
      setState({ ...state, topic: null });
    } else {
      setState({ ...state, topic: field.value });
    }
  };

  const handleValidationTitle = () => {
    if (state.title === "") {
      setEmptyTitleNotice(true);
    }
  };

  // const handleDeadlineError = () => {
  //   setEmptyDeadlineNotice(true);
  // };

  const handleValidationTopic = () => {
    if (state.topic === null) {
      setEmptyTopicNotice(true);
    }
  };

  const validateGoogleDriveLink = (link) => {
    if (!link) return false; // Required field for documents
    const googleDrivePattern =
      /^https:\/\/drive\.google\.com\/(file\/d\/|open\?id=|drive\/folders\/)/;
    return googleDrivePattern.test(link);
  };

  const renderNotice = () => {
    if (emptyFieldNotice) {
      setTimeout(() => setEmptyFieldNotice(false), 1000);
      return (
        <Alert severity="error">
          Vui lòng điền đầy đủ tiêu đề, link Google Drive và chủ đề tài liệu
        </Alert>
      );
    }
    if (emptyTitleNotice) {
      setTimeout(() => setEmptyTitleNotice(false), 1000);
      return <Alert severity="error">Tiêu đề không được để trống</Alert>;
    }
    if (emptyTopicNotice) {
      setTimeout(() => setEmptyTopicNotice(false), 1000);
      return <Alert severity="error">Chủ đề không được để trống</Alert>;
    }
    if (invalidLinkNotice) {
      setTimeout(() => setInvalidLinkNotice(false), 1000);
      return <Alert severity="error">Link Google Drive không hợp lệ</Alert>;
    }
    if (err) {
      setTimeout(handleReset, 1000);
      return <Alert severity="error">{err?.response.data.message}</Alert>;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      state.title === "" ||
      state.topic === null ||
      state.googleDriveLink === ""
    ) {
      setEmptyFieldNotice(true);
      return;
    }

    // Validate Google Drive link
    if (!validateGoogleDriveLink(state.googleDriveLink)) {
      setInvalidLinkNotice(true);
      return;
    }

    const requestData = {
      classroomId: classroomId,
      title: state.title,
      googleDriveLink: state.googleDriveLink,
      topic: state.topic,
      description: state.description,
    };

    dispatch(createDocument(requestData));
    setRender(!render);
  };

  const handleReset = () => {
    dispatch(resetCreateDocument());
  };

  // Check if user is teacher of this specific classroom
  const currentUser = userData?.user;
  const isTeacherOfThisClass = currentUser?.classTeacher?.some(
    (classroom) => classroom._id === classroomId
  );

  // Get classroom name from localStorage or Redux
  const currentClassInfo = classInfo || classroomData?.classroom;

  // Show loading while user data or classroom data is being fetched
  if (userLoading || !userData || (!classInfo && classroomLoading)) {
    return <Loading />;
  }

  // Check permission after user data is loaded
  if (!isTeacherOfThisClass) {
    return <Navigate to={`/classroom/${classroomId}/homework`} replace />;
  }

  if (loading) {
    return <Loading />;
  }

  if (data) {
    // alert("Tạo tài liệu thành công!");
    setTimeout(handleReset, 1000);
    return <Navigate to={`/classroom/${classroomId}/homework`} />;
  }

  return (
    <section className="upload-document container">
      <div className="header">
        <Link
          to={{ pathname: `/classroom/${classroomId}/stream` }}
          style={{ textDecoration: "none" }}
        >
          <div className="classroom-name">{currentClassInfo?.name}</div>
        </Link>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="error"
            className="btn-add"
            onClick={() => history(`/classroom/${classroomId}/homework`)}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            className="btn-add"
            onClick={handleSubmit}
          >
            Đăng Tài Liệu
          </Button>
        </Stack>
      </div>

      <Box className="box-notice">{renderNotice()}</Box>

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
                value={state.title}
                onChange={handleChange}
                onBlur={handleValidationTitle}
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
                minRows={5}
                value={state.description}
                onChange={handleChange}
                // onBlur={handleValidationName}
              />
            </Box>
            <Box className="input-box">
              <AttachFileIcon
                fontSize="large"
                color="action"
                className="icon-input"
              />
              <TextField
                variant="filled"
                margin="normal"
                required
                fullWidth
                id="googleDriveLink"
                label="Link Google Drive"
                type="url"
                name="googleDriveLink"
                autoComplete="off"
                value={state.googleDriveLink}
                onChange={handleChange}
                placeholder="https://drive.google.com/file/d/..."
                helperText="Nhập link chia sẻ Google Drive của tài liệu"
              />
            </Box>
          </div>

          <div className="col-md-3 right">
            <Box sx={{ pb: 2 }}>
              <Typography className="input-label">Chủ đề</Typography>
              <CreatableSelect
                isClearable
                formatCreateLabel={(inputValue) =>
                  "Tạo chủ đề mới: " + inputValue
                }
                defaultValue={allTopics[0]}
                placeholder="Chọn chủ đề"
                onChange={handleTopicChange}
                onBlur={handleValidationTopic}
                options={allTopics}
                size="large"
              />
            </Box>
          </div>
        </div>
      </Box>

      <Box className="box-notice-mobile">{renderNotice()}</Box>
      <Stack direction="row" spacing={2} className="box-mobile-add">
        <Button
          variant="contained"
          color="error"
          className="btn-mobile-add"
          onClick={() => history(`/classroom/${classroomId}/homework`)}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="contained"
          className="btn-mobile-add"
          onClick={handleSubmit}
        >
          Đăng tài liệu
        </Button>
      </Stack>
    </section>
  );
}

export default UploadDocument;
