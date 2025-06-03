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
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { useDispatch, useSelector } from "react-redux";
import CreatableSelect from "react-select/creatable";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  createHomework,
  resetCreateHomework,
} from "../../redux/modules/Homework/action";
import {
  fetchUserInfo,
  fetchClassroomInfo,
} from "../../redux/modules/Home/action";
import Loading from "../../components/Loading";
import MobileDateTimePicker from "@mui/lab/MobileDateTimePicker";
import { useNavigate } from "react-router-dom";

function AssignHomework() {
  const classInfoString = localStorage.getItem("classInfo");
  const classInfo = classInfoString ? JSON.parse(classInfoString) : null;
  const { classroomId } = useParams();
  const history = useNavigate();

  const dispatch = useDispatch();
  const [render, setRender] = useState(false);

  const data = useSelector((state) => state.createHomeworkReducer.data);
  const loading = useSelector((state) => state.createHomeworkReducer.loading);
  const err = useSelector((state) => state.createHomeworkReducer.err);

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
    deadline: new Date(new Date().setHours(24, 0, 0, 0)),
    googleDriveLink: "",
    topic: "Không có chủ đề",
  });

  useEffect(() => {
    // Only reset state when component first mounts, not on every render
    // setState({
    //   title: "",
    //   description: "",
    //   deadline: new Date(new Date().setHours(24, 0, 0, 0)),
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
  const [emptyTopicNotice, setEmptyTopicNotice] = useState(false);
  const [emptyFieldNotice, setEmptyFieldNotice] = useState(false);
  const [invalidLinkNotice, setInvalidLinkNotice] = useState(false);

  const rawTopic = useSelector((state) => state.homeworkReducer.data);
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

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleDeadlineChange = (date) => {
    if (date === null || date === "Invalid Date") {
      setState({ ...state, deadline: null });
    } else {
      setState({ ...state, deadline: date });
    }
  };

  const handleTopicChange = (field) => {
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

  const handleValidationTopic = () => {
    if (state.topic === null) {
      setEmptyTopicNotice(true);
    }
  };

  const validateGoogleDriveLink = (link) => {
    if (!link) return true; // Optional field
    const googleDrivePattern =
      /^https:\/\/drive\.google\.com\/(file\/d\/|open\?id=|drive\/folders\/)/;
    return googleDrivePattern.test(link);
  };

  const renderNotice = () => {
    if (emptyFieldNotice) {
      setTimeout(() => setEmptyFieldNotice(false), 1000);
      return (
        <Alert severity="error">
          Vui lòng điền đầy đủ tiêu đề, hạn nộp và chủ đề bài tập
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

    if (state.title === "" || state.deadline === null || state.topic === null) {
      setEmptyFieldNotice(true);
      return;
    }

    // Validate Google Drive link if provided
    if (
      state.googleDriveLink &&
      !validateGoogleDriveLink(state.googleDriveLink)
    ) {
      setInvalidLinkNotice(true);
      return;
    }

    const requestData = {
      classroomId: classroomId,
      title: state.title,
      googleDriveLink: state.googleDriveLink,
      topic: state.topic,
      deadline: state.deadline,
      description: state.description,
    };

    dispatch(createHomework(requestData));
    setRender(!render);
  };

  const handleReset = () => {
    dispatch(resetCreateHomework());
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
    // alert("Tạo bài tập thành công!");
    setTimeout(handleReset, 1000);
    // history.push(`/classroom/${classroomId}/homework`);

    return <Navigate to={`/classroom/${classroomId}/homework`} />;
  }

  return (
    <section className="assign-homework container">
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
            Giao bài tập
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
                fullWidth
                id="googleDriveLink"
                label="Link Google Drive (tùy chọn)"
                type="url"
                name="googleDriveLink"
                autoComplete="off"
                value={state.googleDriveLink}
                onChange={handleChange}
                placeholder="https://drive.google.com/file/d/..."
                helperText="Nhập link chia sẻ Google Drive nếu có tài liệu đính kèm"
              />
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
                disabled
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
                  minDateTime={new Date()}
                  value={state.deadline}
                  onChange={handleDeadlineChange}
                />
              </LocalizationProvider>
            </Box>
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
          Giao bài tập
        </Button>
      </Stack>
    </section>
  );
}

export default AssignHomework;
