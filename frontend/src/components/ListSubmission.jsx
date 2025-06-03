import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { styled } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";
import { Avatar, Button, Checkbox, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAllSubmission } from "../redux/modules/HomeworkDetail/action";
import Loading from "./Loading";
import { pathImgFromIndex } from "../utils/constants";
import DialogAddScore from "./DialogAddScore";
import DialogUpdateScore from "./DialogUpdateScore";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#A3EBFB",
    color: "#000",
    fontSize: 16,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function DataSubmissionCell(props) {
  const { data } = props;

  // Dialog Add Score
  const [openAddScoreDialog, setOpenAddScoreDialog] = useState(false);

  const handleOpenAddScoreDialog = () => {
    setOpenAddScoreDialog(true);
  };

  const handleCloseAddScoreDialog = () => {
    setOpenAddScoreDialog(false);
  };

  // Dialog Update Score
  const [openUpdateScoreDialog, setOpenUpdateScoreDialog] = useState(false);

  const handleOpenUpdateScoreDialog = () => {
    setOpenUpdateScoreDialog(true);
  };

  const handleCloseUpdateScoreDialog = () => {
    setOpenUpdateScoreDialog(false);
  };

  return (
    <React.Fragment>
      <StyledTableCell>
        <Avatar
          src={
            data.studentId.avatarUrl !== undefined
              ? data.studentId.avatarUrl
              : pathImgFromIndex + "avatar.png"
          }
          alt="avatar"
          sx={{ width: 64, height: 64 }}
        />
      </StyledTableCell>
      <StyledTableCell>{data.studentId?.fullName}</StyledTableCell>

      {data.fileAttributes?.length === 0 ? (
        <StyledTableCell>Chưa nộp bài</StyledTableCell>
      ) : (
        <StyledTableCell>
          <Stack direction="row" spacing={2}>
            {data?.attachedFiles && data?.attachedFiles[0] ? (
              <a
                href={data?.attachedFiles[0]}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: "none",
                  color: "#1976d2",
                  fontWeight: "bold",
                  width: 200,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  display: "block",
                }}
                title="Mở bài làm Google Drive"
              >
                📁 {data.fileAttributes[0]?.name || "Bài làm Google Drive"}
              </a>
            ) : (
              <Typography
                style={{
                  width: 200,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {data.fileAttributes[0]?.name || "Không có file"}
              </Typography>
            )}
            {data?.attachedFiles && data?.attachedFiles[0] && (
              <a
                title="Mở Google Drive"
                href={data?.attachedFiles[0]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DownloadIcon fontSize={"large"} />
              </a>
            )}
          </Stack>
        </StyledTableCell>
      )}

      {data.markDone ? (
        <StyledTableCell sx={{ color: "#00dc00" }}>Đã nộp</StyledTableCell>
      ) : (
        <StyledTableCell sx={{ color: "red" }}>Thiếu</StyledTableCell>
      )}

      {data.score === undefined ? (
        <StyledTableCell align="right">...</StyledTableCell>
      ) : (
        <StyledTableCell align="right">
          <div>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>
              {data.score}
            </span>
            {data.comment && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  fontStyle: "italic",
                  marginTop: "4px",
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                💬 {data.comment}
              </div>
            )}
          </div>
        </StyledTableCell>
      )}

      {data.score === undefined ? (
        <StyledTableCell align="right">
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "flex-end" }}
          >
            <Checkbox
              checked={false}
              sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
            />
            <Button
              variant="contained"
              sx={{ width: 75, borderRadius: 7 }}
              onClick={handleOpenAddScoreDialog}
            >
              Chấm
            </Button>
          </Stack>

          <DialogAddScore
            openAddScoreDialog={openAddScoreDialog}
            handleCloseAddScoreDialog={handleCloseAddScoreDialog}
            studentId={data.studentId?._id}
          />
        </StyledTableCell>
      ) : (
        <StyledTableCell align="right">
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "flex-end" }}
          >
            <Checkbox
              checked={true}
              sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
            />
            <Button
              variant="contained"
              color="error"
              sx={{ width: 75, borderRadius: 7 }}
              onClick={handleOpenUpdateScoreDialog}
            >
              Sửa
            </Button>
          </Stack>

          <DialogUpdateScore
            openUpdateScoreDialog={openUpdateScoreDialog}
            handleCloseUpdateScoreDialog={handleCloseUpdateScoreDialog}
            submission={data}
          />
        </StyledTableCell>
      )}
    </React.Fragment>
  );
}

function ListSubmission() {
  const { homeworkId } = useParams();
  useEffect(() => {
    dispatch(fetchAllSubmission(homeworkId));
    //eslint-disable-next-line
  }, []);

  const dispatch = useDispatch();

  const dataFetch = useSelector(
    (state) => state.fetchAllSubmissionReducer?.data
  );
  const loadingFetch = useSelector(
    (state) => state.fetchAllSubmissionReducer?.loading
  );
  const errFetch = useSelector((state) => state.fetchAllSubmissionReducer?.err);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const submissionDoneList = dataFetch?.filter(
    (submission) => submission.markDone === true
  );

  const renderRow = () => {
    return dataFetch
      ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((data, key) => {
        return (
          <StyledTableRow role="checkbox" tabIndex={-1} key={key}>
            <DataSubmissionCell data={data} />
          </StyledTableRow>
        );
      });
  };

  if (loadingFetch) {
    return <Loading />;
  }

  if (errFetch) {
    console.log(errFetch);
  }

  return (
    <div className="list-submission">
      <div className="header-submission">
        <h4>Danh sách bài nộp</h4>
        <p>
          Đã nộp:{" "}
          <span>
            {submissionDoneList?.length}/{dataFetch?.length}
          </span>
        </p>
      </div>

      <div className="header-line"></div>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell>Họ và tên</StyledTableCell>
                <StyledTableCell>Bài nộp</StyledTableCell>
                <StyledTableCell>Tình trạng</StyledTableCell>
                <StyledTableCell align="right">Điểm số</StyledTableCell>
                <StyledTableCell align="right">Chấm điểm</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderRow()}</TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={dataFetch?.length}
          rowsPerPage={rowsPerPage}
          labelRowsPerPage="Số dòng:"
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

export default ListSubmission;
