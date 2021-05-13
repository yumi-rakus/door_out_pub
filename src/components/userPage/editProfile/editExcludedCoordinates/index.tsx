import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import {
  fetchExcludedCoordinates,
  removeExcludedCoordinate,
  selectExcludedCoordinates
} from "~/store/slice/Domain/excludedCoordinate.slice";

import Header from "~/components/elements/other/Header";
import DeleteDialog from "~/components/elements/other/DeleteDialog";
import {
  Grid,
  List,
  makeStyles,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  Typography,
  CircularProgress
} from "@material-ui/core";
import { AddCircle, Delete } from "@material-ui/icons";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import { useLoadScript } from "@react-google-maps/api";
import { API_KEY, LIBRARIES } from "~/api.config";

import { useSnackbar } from "notistack";
import { useErrorHandle } from "~/utils/useErrorHandle";

import HeaderStyle from "~/assets/css/Header.module.css";
import { HEADER_HEIGHT, THEME_COLOR1 } from "~/assets/ExportCSS";

/**
 * /// MEMO ///
 * ExcludedCoordinate（投稿回避地点）を
 * ExCdと省略して記述する.
 */

const EditExcludedCoordinates: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES
  });
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const excludedCoordinates = useSelector(selectExcludedCoordinates);

  // component/state
  const [isFetching, setIsFetching] = useState(false);
  const [isOpenedDeleteDialog, setIsOpenedDeleteDialog] = useState(false);
  const [selectExCdId, setSelectExCdId] = useState("");

  useEffect(() => {
    setIsFetching(true);
    dispatch(fetchExcludedCoordinates())
      .then(() => {
        setIsFetching(false);
      })
      .catch(e => {
        catchUnauthorizedError(e.message);
        if (e.message === "404") history.go(0);
      });
  }, [catchUnauthorizedError, dispatch, history]);

  // ---------------------- methods ----------------------

  /**
   * DeleteDialogを開く.
   *
   * @param exCdId: 投稿回避地点ID
   */
  const handleClickDelete = (exCdId: string) => {
    setSelectExCdId(exCdId);
    setIsOpenedDeleteDialog(true);
  };

  /**
   * DeleteDialogを閉じる.
   */
  const handleCancelDelete = () => {
    setIsOpenedDeleteDialog(false);
  };

  /**
   * 投稿回避地点を削除する.
   */
  const handleDelete = () => {
    setIsOpenedDeleteDialog(false);
    setIsFetching(true);
    dispatch(removeExcludedCoordinate(selectExCdId))
      .then(() => {
        setSelectExCdId("");
        dispatch(fetchExcludedCoordinates())
          .then(() => {
            setIsFetching(false);
          })
          .catch(e => {
            const statusCode = e.message;
            catchUnauthorizedError(statusCode);
            if (statusCode === "404") history.go(0);
          });
      })
      .catch(e => {
        const statusCode = e.message;
        catchUnauthorizedError(statusCode);
        if (statusCode === "400") {
          enqueueSnackbar(
            "削除に失敗しました。3秒後にページをリロードします。",
            { variant: "error" }
          );
          setTimeout(() => {
            history.go(0);
          }, 3000);
        }
      });
  };

  /**
   * 投稿回避地点編集を完了する.
   */
  const handleClickComplete = () => {
    history.push({ pathname: Path.editProfile });
  };

  /**
   *　投稿回避地点を追加する.
   */
  const handleClickAddExCd = () => {
    history.push({ pathname: Path.addExcludedCoordinate });
  };

  // ---------------------- JSX Element ----------------------
  // 投稿回避地点の一覧を表すJSXを作成
  const excludedCoordinateList =
    excludedCoordinates &&
    excludedCoordinates.map(exCd => (
      <div key={exCd.excludedCoordinateId}>
        <ListItem>
          <ListItemText>
            <Grid container direction={"column"}>
              <Grid item className={classes.placeName}>
                {exCd.placeName}
              </Grid>
              <Grid item>{exCd.address}</Grid>
            </Grid>
          </ListItemText>
          <ListItemSecondaryAction>
            <IconButton
              edge={"end"}
              onClick={() => handleClickDelete(exCd.excludedCoordinateId!)}
            >
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <Divider />
      </div>
    ));

  // ---------------------- Header JSX Element ----------------------

  const completeBtn = (
    <Button
      variant={"outlined"}
      color={"primary"}
      size={"small"}
      className={HeaderStyle.lastBtn}
      onClick={handleClickComplete}
    >
      完了
    </Button>
  );

  // ---------------------- Google Maps API Loading Element ----------------------

  if (loadError) {
    handleClickComplete();
  }

  return (
    <div>
      <Header first={null} middle={null} last={completeBtn} />
      {!isLoaded ? null : (
        <Grid
          container
          justify={"center"}
          alignItems={"center"}
          direction={"column"}
          className={classes.editExcludedCoordinates}
        >
          <Grid item className={classes.gridItem}>
            <Typography className={classes.typography}>
              投稿の位置情報が登録された投稿回避地点周辺の場合に警告文を表示し、個人情報の漏洩を防ぎます。5つまで投稿回避地点を登録することができます。
            </Typography>
          </Grid>
          <Grid item className={classes.gridItem} style={{ textAlign: "left" }}>
            <IconButton
              onClick={handleClickAddExCd}
              disabled={
                excludedCoordinates === null ||
                excludedCoordinates?.length === 5
              }
            >
              <AddCircle
                style={{
                  color:
                    excludedCoordinates !== null &&
                    excludedCoordinates?.length !== 5
                      ? THEME_COLOR1
                      : "grey"
                }}
                fontSize={"large"}
              />
            </IconButton>
          </Grid>
          <Grid item className={classes.gridItem}>
            {isFetching ? (
              <CircularProgress />
            ) : (
              <List>{excludedCoordinateList}</List>
            )}
          </Grid>
        </Grid>
      )}
      <DeleteDialog
        isOpened={isOpenedDeleteDialog}
        deleteTarget={"投稿回避登録地点"}
        handleCancel={handleCancelDelete}
        handleDelete={handleDelete}
      />
    </div>
  );
};

const useStyles = makeStyles(() => ({
  editExcludedCoordinates: {
    marginTop: HEADER_HEIGHT
  },
  gridItem: {
    width: "90%"
  },
  typography: {
    color: "grey",
    fontSize: "8px",
    textAlign: "left"
  },
  placeName: {
    fontWeight: "bold"
  }
}));

export default EditExcludedCoordinates;