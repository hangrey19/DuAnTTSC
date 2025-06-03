import React, { useState, useEffect } from "react";
import { pathImgFromIndex } from "../../utils/constants";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  IconButton,
  Button,
  Paper,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserInfo } from "../../redux/modules/Home/action";
import {
  changeAvatar,
  resetAvatar,
  changeInformation,
  resetChangeInformation,
} from "../../redux/modules/UserAccount/action";

import Loading from "../../components/Loading";

function UserAccount() {
  const dispatch = useDispatch();
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submit, setSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (submit === true) {
      setSubmitting(true);
      setSubmit(false);
      setPreview(null);
      dispatch(changeAvatar(avatar));
    }
    //eslint-disable-next-line
  }, [submit]);

  const changeAvaSuccess = useSelector(
    (state) => state.changeAvatarReducer?.data
  );

  const changeInfoSuccess = useSelector(
    (state) => state.changeInformationReducer?.data
  );

  const changeInfoLoading = useSelector(
    (state) => state.changeInformationReducer?.loading
  );

  const changeInfoError = useSelector(
    (state) => state.changeInformationReducer?.err
  );

  useEffect(() => {
    if (avatar !== null) {
      const objectUrl = URL.createObjectURL(avatar);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    //eslint-disable-next-line
  }, [avatar]);

  useEffect(() => {
    dispatch(fetchUserInfo());
    //eslint-disable-next-line
  }, []);

  const data = useSelector((state) => state.fetchUserInfoReducer?.data);
  const user = data?.user;
  const loading = useSelector((state) => state.fetchUserInfoReducer.loading);
  const err = useSelector((state) => state.fetchUserInfoReducer.err);

  if (changeAvaSuccess) {
    dispatch(resetAvatar());
    dispatch(fetchUserInfo());
    localStorage.removeItem("avatar");
    setSubmitting(false);
    setAvatar(null);
    window.location.reload(false);
  }

  if (changeInfoSuccess) {
    dispatch(resetChangeInformation());
    dispatch(fetchUserInfo());
    setEditDialogOpen(false);
    setEditField(null);
    setEditValue("");
  }

  const convertDate = (date) => {
    if (!date) return "Chưa có thông tin";
    date = new Date(date);
    var dd = String(date.getDate()).padStart(2, "0");
    var mm = String(date.getMonth() + 1).padStart(2, "0");
    var yyyy = date.getFullYear();
    return dd + "/" + mm + "/" + yyyy;
  };

  if (loading || submitting || changeInfoLoading) {
    return <Loading />;
  }

  if (err) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Không thể tải thông tin người dùng
          </Typography>
          <Button
            variant="contained"
            onClick={() => dispatch(fetchUserInfo())}
            sx={{ mt: 2 }}
          >
            Thử lại
          </Button>
        </Paper>
      </Container>
    );
  }

  const onFilesChange = (event) => {
    if (event.target.files[0] !== undefined) {
      setAvatar(event.target.files[0]);
    }
  };

  const handleChangeAvatar = () => {
    setSubmit(true);
  };

  const handleEditClick = (field, currentValue) => {
    setEditField(field);
    setEditValue(currentValue || "");
    setEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    // Prepare the data - only include the fields we want to update
    const formData = {
      username: user?.username || "",
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    };

    // Update the specific field being edited
    if (editField === "fullName") {
      formData.fullName = editValue;
    } else if (editField === "email") {
      formData.email = editValue;
    } else if (editField === "phoneNumber") {
      formData.phoneNumber = editValue;
    }

    dispatch(changeInformation(formData));
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditField(null);
    setEditValue("");
    dispatch(resetChangeInformation());
  };

  const InfoItem = ({ icon, label, value, editable = false, field }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f8f9fa",
      }}
    >
      <Box sx={{ color: "#1976d2", mr: 2 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant="body1" sx={{ mt: 0.5, wordBreak: "break-word" }}>
          {value || "Chưa cập nhật"}
        </Typography>
      </Box>
      {editable && (
        <IconButton
          size="small"
          sx={{ color: "#1976d2" }}
          onClick={() => handleEditClick(field, value)}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{ height: "fit-content", position: "sticky", top: 20 }}
          >
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Box
                sx={{ position: "relative", display: "inline-block", mb: 3 }}
              >
                <input
                  accept="image/*"
                  id="avatar-upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={onFilesChange}
                  onClick={(event) => {
                    event.currentTarget.value = null;
                  }}
                />
                <label htmlFor="avatar-upload">
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      cursor: "pointer",
                      border: "4px solid #e3f2fd",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        border: "4px solid #1976d2",
                        transform: "scale(1.05)",
                      },
                    }}
                    src={
                      preview !== null
                        ? preview
                        : user?.avatarUrl && user?.avatarUrl !== ""
                        ? user?.avatarUrl
                        : pathImgFromIndex + "meo_ngu_ngoc.jpg"
                    }
                    onError={(e) => {
                      e.target.src = pathImgFromIndex + "meo_ngu_ngoc.jpg";
                    }}
                  />
                </label>
              </Box>

              {preview && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleChangeAvatar}
                  sx={{ mb: 2 }}
                >
                  Cập nhật Avatar
                </Button>
              )}

              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#1976d2", mb: 1 }}
              >
                {user?.username || "Chưa có tên"}
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {user?.fullName || "Chưa cập nhật họ tên"}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "space-around" }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    {user?.classTeacher?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lớp giảng dạy
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    {user?.classStudent?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lớp tham gia
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    {user
                      ? Number(
                          (user?.classStudent?.length || 0) +
                            (user?.classTeacher?.length || 0)
                        )
                      : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng lớp học
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Information Card */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 3, color: "#1976d2" }}
              >
                Thông tin cá nhân
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    icon={<PersonIcon />}
                    label="Họ và tên"
                    value={user?.fullName}
                    editable={true}
                    field="fullName"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    icon={<EmailIcon />}
                    label="Email"
                    value={user?.email}
                    editable={true}
                    field="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    icon={<PhoneIcon />}
                    label="Số điện thoại"
                    value={user?.phoneNumber}
                    editable={true}
                    field="phoneNumber"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem
                    icon={<CalendarTodayIcon />}
                    label="Ngày tạo tài khoản"
                    value={convertDate(user?.createdAt)}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, color: "#1976d2" }}
              >
                Vai trò trong hệ thống
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {(user?.classTeacher?.length || 0) > 0 && (
                  <Chip
                    icon={<SchoolIcon />}
                    label={`Giáo viên (${user?.classTeacher?.length || 0} lớp)`}
                    color="primary"
                    variant="outlined"
                    size="medium"
                  />
                )}
                {(user?.classStudent?.length || 0) > 0 && (
                  <Chip
                    icon={<PersonIcon />}
                    label={`Học sinh (${user?.classStudent?.length || 0} lớp)`}
                    color="secondary"
                    variant="outlined"
                    size="medium"
                  />
                )}
                {!user?.classTeacher?.length && !user?.classStudent?.length && (
                  <Chip
                    label="Chưa tham gia lớp học nào"
                    color="default"
                    variant="outlined"
                    size="medium"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Information Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
        <DialogContent>
          {changeInfoError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {changeInfoError?.response?.data?.message ||
                "Có lỗi xảy ra khi cập nhật thông tin"}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={
              editField === "fullName"
                ? "Họ và tên"
                : editField === "email"
                ? "Email"
                : editField === "phoneNumber"
                ? "Số điện thoại"
                : "Thông tin"
            }
            type={editField === "email" ? "email" : "text"}
            fullWidth
            variant="outlined"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Hủy</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={!editValue.trim()}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default UserAccount;
