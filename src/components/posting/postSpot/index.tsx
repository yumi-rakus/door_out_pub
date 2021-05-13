import React, { useState, useEffect, ChangeEvent } from "react";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AppDispatch } from "~/store";
import { SpotForm, postSpot } from "~/store/slice/Domain/post.slice";
import { fetchLoginUser, selectLoginUser } from "~/store/slice/App/auth.slice";
import {
  fetchExcludedCoordinates,
  selectExcludedCoordinates
} from "~/store/slice/Domain/excludedCoordinate.slice";

import WarningDialog from "~/components/posting/WarningDialog";
import TagForm from "~/components/posting/TagForm";
import PositionInfo from "~/components/posting/PositionInfo";
import PostUserInfo from "~/components/elements/post/PostUserInfo";
import ImageAttached from "~/components/posting/ImageAttached";
import Header from "~/components/elements/other/Header";
import {
  makeStyles,
  Button,
  Grid,
  TextField,
  Typography
} from "@material-ui/core";
import { Room, LocalOffer } from "@material-ui/icons";

import { useHistory, useLocation } from "react-router-dom";
import { Path } from "~/router/routes";

import { useLoadScript } from "@react-google-maps/api";
import { API_KEY, LIBRARIES } from "~/api.config";

import HeaderStyle from "~/assets/css/Header.module.css";
import { HEADER_HEIGHT } from "~/assets/ExportCSS";

import { useSnackbar } from "notistack";
import { useErrorHandle } from "~/utils/useErrorHandle";

import { Tag } from "~/interfaces";

const GEOCODE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";

//2地点の座標から距離を計算する座標（地球を直径を6371kmの球体とした時の計算方法）
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  lat1 *= Math.PI / 180;
  lng1 *= Math.PI / 180;
  lat2 *= Math.PI / 180;
  lng2 *= Math.PI / 180;
  return (
    6371 *
    Math.acos(
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) +
        Math.sin(lat1) * Math.sin(lat2)
    )
  );
};

type locationState = {
  spotName: string;
};

const PostSpot: React.FC = () => {
  const classes = postSpotStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  // eslint-disable-next-line
  const location = useLocation<locationState>();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();
  useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES
  });

  // store/state
  const excludedCoordinates = useSelector(selectExcludedCoordinates);
  const loginUser = useSelector(selectLoginUser);

  // component/state
  const [tags, setTags] = useState<Array<Tag> | null>(null);
  const [spotName, setSpotName] = useState(
    location.state !== undefined ? location.state.spotName : ""
  );
  const [latLng, setLatLng] = useState({
    results: [{ geometry: { location: { lat: null, lng: null } } }],
    status: ""
  });
  const [spotForm, setSpotForm] = useState<SpotForm>({
    postType: "1",
    content: "",
    spotName: "",
    canPostForcibly: false,
    tags: [],
    spotCoordinate: {
      latitude: 0,
      longitude: 0
    },
    base64Images: []
  });
  const [contentLength, setContentLength] = useState(0);
  const [isValidContent, setIsValidContent] = useState<null | boolean>(null);
  const [isValidLocation, setIsValidLocation] = useState<null | boolean>(null);
  const [isValidTagCount, setIsValidTagCount] = useState<boolean>(true);
  const [isOpenedWarningDialog, setIsOpenedWarningDialog] = useState(false);
  const [canPost, setCanPost] = useState(false);

  useEffect(() => {
    if (!loginUser) {
      dispatch(fetchLoginUser()).catch(e => {
        catchUnauthorizedError(e.message);
      });
    }
  }, [catchUnauthorizedError, dispatch, loginUser]);

  useEffect(() => {
    if (loginUser) {
      dispatch(fetchExcludedCoordinates()).catch(e => {
        catchUnauthorizedError(e.message);
      });
    }
  }, [catchUnauthorizedError, dispatch, loginUser]);

  //位置情報を変更するごとに座標を取得する
  useEffect(() => {
    if (spotName) {
      setSpotForm({ ...spotForm, spotName: spotName });
      setIsValidLocation(true);
      fetchLatLng();
    } else {
      setIsValidLocation(false);
    }
    // eslint-disable-next-line
  }, [spotName]);

  //取得した座標をpostに追加
  useEffect(() => {
    const lat = latLng.results[0].geometry.location.lat;
    const lng = latLng.results[0].geometry.location.lng;
    if (lat !== null && lng !== null) {
      setSpotForm({
        ...spotForm,
        spotCoordinate: {
          latitude: lat,
          longitude: lng
        }
      });
    }
    // eslint-disable-next-line
  }, [latLng]);

  //タグをpostに追加
  useEffect(() => {
    if (tags) {
      setSpotForm({ ...spotForm, tags: [...tags] });
    }
    // eslint-disable-next-line
  }, [tags]);

  useEffect(() => {
    if (isValidLocation && isValidContent && isValidTagCount) {
      setCanPost(true);
    } else if (!isValidLocation || !isValidContent || !isValidTagCount) {
      setCanPost(false);
    }
  }, [isValidLocation, isValidContent, isValidTagCount]);

  /**
   * contentが入力されると走る処理.
   *
   * @param event: ChangeEvent<HTMLInputElement>
   */
  const handleChangeContent = (event: ChangeEvent<HTMLInputElement>) => {
    setSpotForm({ ...spotForm, content: event.target.value });

    const inputLength = event.target.value.replace("　", " ").trim().length;
    setContentLength(inputLength);
    if (inputLength === 0 || inputLength > 255) {
      setIsValidContent(false);
    } else {
      setIsValidContent(true);
    }
  };

  /**
   * 地点投稿を行う.
   */
  const handleClickPostBtn = () => {
    setCanPost(false);

    setSpotForm({
      ...spotForm,
      content: spotForm.content.replace("　", " ").trim()
    });

    setSpotForm({
      ...spotForm,
      spotCoordinate: {
        latitude:
          Math.round(spotForm.spotCoordinate.latitude * 10000000) / 10000000,
        longitude:
          Math.round(spotForm.spotCoordinate.longitude * 10000000) / 10000000
      }
    });

    if (excludedCoordinates && excludedCoordinates.length > 0) {
      for (let i = 0; i < excludedCoordinates.length; i++) {
        const distance = calculateDistance(
          spotForm.spotCoordinate.latitude,
          spotForm.spotCoordinate.longitude,
          excludedCoordinates[i].latitude,
          excludedCoordinates[i].longitude
        );
        if (distance > 10) {
          if (i === excludedCoordinates.length - 1) {
            // TODO: サーバー側で回避地点チェックにひっかかったときの処理をあとで追加
            dispatchPostSpot();
          }
        } else {
          setIsOpenedWarningDialog(true);
          break;
        }
      }
    } else if (excludedCoordinates && excludedCoordinates.length === 0) {
      dispatchPostSpot();
    }
  };

  /**
   * dispatch(postSpot(spotForm))を実行する.
   */
  const dispatchPostSpot = () => {
    dispatch(postSpot(spotForm))
      .then(() => {
        enqueueSnackbar("投稿が完了しました", { variant: "success" });
        history.push({ pathname: Path.map });
      })
      .catch(e => {
        const statusCode = e.message;
        catchUnauthorizedError(statusCode);
        if (statusCode === "400" || statusCode === "422") {
          resetState();
          enqueueSnackbar("投稿に失敗しました", { variant: "error" });
        }
      });
  };

  /**
   * 各stateを初期値に戻す.
   */
  const resetState = () => {
    setContentLength(0);
    setIsValidContent(null);
    setIsValidLocation(null);
    setIsValidTagCount(true);
    setSpotName("");
    setSpotForm({
      postType: "1",
      content: "",
      spotName: "",
      tags: [],
      spotCoordinate: {
        latitude: 0,
        longitude: 0
      },
      base64Images: [],
      canPostForcibly: false
    });
  };

  /**
   * 投稿をやめ、地図画面へ遷移する.
   */
  const handleCancel = () => {
    history.push({ pathname: Path.map });
  };

  /**
   * 住所から緯度経度を取得する.
   */
  const fetchLatLng = async () => {
    const result = await axios.get(GEOCODE_ENDPOINT, {
      params: {
        key: API_KEY,
        address: spotName,
        language: "ja"
      }
    });
    setLatLng(result.data);
  };

  // ---------------------- Header JSX Element ----------------------
  // キャンセルボタン
  const cancelBtn = (
    <Typography className={HeaderStyle.cancel} onClick={handleCancel}>
      キャンセル
    </Typography>
  );

  // 投稿ボタン
  const postBtn = (
    <>
      <Button
        className={HeaderStyle.lastBtn}
        size={"small"}
        variant={"contained"}
        color={"primary"}
        disableElevation
        onClick={handleClickPostBtn}
        disabled={!canPost}
      >
        投稿
      </Button>
      <WarningDialog
        isOpen={isOpenedWarningDialog}
        handleClose={() => {
          setIsOpenedWarningDialog(false);
          setCanPost(true);
        }}
        post={spotForm}
        postDispatch={postSpot}
      />
    </>
  );

  return (
    <div>
      <Header first={cancelBtn} middle={null} last={postBtn} />
      {loginUser && (
        <Grid
          container
          justify={"center"}
          alignItems={"center"}
          className={classes.main}
        >
          {/*投稿ユーザー*/}
          <Grid item className={classes.gridItem}>
            <PostUserInfo postUser={loginUser} inPostingPage={true} />
          </Grid>

          {/*位置情報入力フォーム*/}
          <Grid item className={classes.gridItem}>
            <Grid container justify={"center"} alignItems={"flex-start"}>
              <Grid item xs={1} className={classes.icon}>
                <Room />
              </Grid>
              <Grid item xs={11}>
                <PositionInfo setAddress={setSpotName} position={spotName} />
              </Grid>
            </Grid>
          </Grid>

          {/*タグ入力フォーム*/}
          <Grid item className={classes.gridItem}>
            <Grid container justify={"center"} alignItems={"flex-start"}>
              <Grid item xs={1} className={classes.icon}>
                <LocalOffer />
              </Grid>
              <Grid item xs={11}>
                <TagForm setTags={setTags} handleValid={setIsValidTagCount} />
              </Grid>
            </Grid>
          </Grid>

          {/*本文入力フォーム*/}
          <Grid item className={classes.gridItem}>
            <TextField
              variant={"outlined"}
              onChange={handleChangeContent}
              multiline
              rows={5}
              helperText={
                isValidContent === null || isValidContent
                  ? contentLength + "/255"
                  : contentLength +
                    "/255" +
                    (contentLength === 0
                      ? " 本文を入力してください"
                      : " 255字以内で入力してください")
              }
              error={isValidContent !== null && !isValidContent}
              fullWidth
            />
          </Grid>

          {/*写真の挿入とプレビュー*/}
          <Grid item className={classes.gridItem}>
            <ImageAttached
              base64Images={spotForm.base64Images}
              setNewBase64Images={newBase64Images => {
                setSpotForm({ ...spotForm, base64Images: newBase64Images });
              }}
            />
          </Grid>
        </Grid>
      )}
    </div>
  );
};

const postSpotStyles = makeStyles(() => ({
  main: {
    marginTop: HEADER_HEIGHT
  },
  gridItem: {
    width: "90%",
    margin: "1vh 0"
  },
  icon: {
    color: "grey",
    marginTop: "5px"
  }
}));

export default PostSpot;
