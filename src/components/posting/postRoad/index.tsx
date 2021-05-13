import React, { useEffect, useState, ChangeEvent } from "react";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { AppDispatch } from "~/store";
import { RoadForm, postRoad } from "~/store/slice/Domain/post.slice";
import { fetchLoginUser, selectLoginUser } from "~/store/slice/App/auth.slice";
import {
  fetchExcludedCoordinates,
  selectExcludedCoordinates
} from "~/store/slice/Domain/excludedCoordinate.slice";

import Header from "~/components/elements/other/Header";
import TagForm from "~/components/posting/TagForm";
import WarningDialog from "~/components/posting/WarningDialog";
import FromTo from "~/components/posting/postRoad/FromTo";
import PostUserInfo from "~/components/elements/post/PostUserInfo";
import ImageAttached from "~/components/posting/ImageAttached";
import {
  makeStyles,
  Button,
  Grid,
  TextField,
  Typography,
  CircularProgress
} from "@material-ui/core";
import { LocalOffer, Room } from "@material-ui/icons";

import { useHistory, useLocation } from "react-router-dom";
import { Path } from "~/router/routes";

import { GoogleMap, useLoadScript, Polyline } from "@react-google-maps/api";
import { API_KEY } from "~/api.config";

import HeaderStyle from "~/assets/css/Header.module.css";
import { HEADER_HEIGHT } from "~/assets/ExportCSS";

import { useSnackbar } from "notistack";
import { useErrorHandle } from "~/utils/useErrorHandle";

import { Tag } from "~/interfaces";

const GEOCODE_ENDPOINT = "https://maps.googleapis.com/maps/api/geocode/json";
const language = "ja";

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

type Coordinate = {
  lat: number;
  lng: number;
};

type LocationState = {
  from: {
    pathname: string;
  };
  coordinateList: Array<Coordinate>;
  postId: string;
  fromAddress: string;
  toAddress: string;
};

const PostRoad: React.FC = () => {
  const classes = postRoadStyles();
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation<LocationState>();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY
  });

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false
  };

  const mapContainerStyle = {
    width: "100%",
    height: "30vh"
  };

  // store/state
  const excludedCoordinates = useSelector(selectExcludedCoordinates);
  const loginUser = useSelector(selectLoginUser);

  // component/state
  const [tags, setTags] = useState<Array<Tag> | null>(null);
  const [isOpenedWarningDialog, setIsOpenedWarningDialog] = useState(false);
  const [fromAddress, setFromAddress] = useState(location.state.fromAddress);
  const [toAddress, setToAddress] = useState(location.state.toAddress);
  const [latLng, setLatLng] = useState({
    results: [{ geometry: { location: { lat: 0, lng: 0 } } }],
    status: ""
  });
  const [roadForm, setRoadForm] = useState<RoadForm>({
    content: "",
    roadStartSpotName: location.state.fromAddress,
    roadEndSpotName: location.state.toAddress,
    canPostForcibly: false,
    tags: [],
    base64Images: []
  });
  const [contentLength, setContentLength] = useState(0);
  const [isValidContent, setIsValidContent] = useState<null | boolean>(null);
  const [isValidFromLocation, setIsValidFromLocation] = useState<
    null | boolean
  >(null);
  const [isValidToLocation, setIsValidToLocation] = useState<null | boolean>(
    null
  );
  const [isValidTagCount, setIsValidTagCount] = useState<boolean>(true);
  const [center, setCenter] = useState<Coordinate>({
    lat: 35.6809591,
    lng: 139.7673068
  });
  const [coordinateList, setCoordinateList] = useState<Array<Coordinate>>();
  const [canPost, setCanPost] = useState(true);

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

  useEffect(() => {
    setCoordinateList([...location.state.coordinateList]);
    if (location.state.coordinateList.length >= 1) {
      setCenter(location.state.coordinateList[0]);
    }
    setRoadForm({ ...roadForm, roadStartSpotName: location.state.fromAddress });
    setRoadForm({ ...roadForm, roadEndSpotName: location.state.toAddress });
    if (location.state.fromAddress) {
      fetchLatLng(location.state.fromAddress);
    }
    // eslint-disable-next-line
  }, [
    location.state.coordinateList,
    location.state.fromAddress,
    location.state.toAddress
  ]);

  useEffect(() => {
    setRoadForm({
      ...roadForm,
      roadStartSpotName: fromAddress.replace("　", " ").trim()
    });
    // eslint-disable-next-line
  }, [fromAddress]);

  useEffect(() => {
    setRoadForm({
      ...roadForm,
      roadEndSpotName: toAddress.replace("　", " ").trim()
    });
    // eslint-disable-next-line
  }, [toAddress]);

  useEffect(() => {
    if (
      isValidFromLocation &&
      isValidToLocation &&
      isValidContent &&
      isValidTagCount
    ) {
      setCanPost(true);
    } else if (
      !isValidFromLocation ||
      !isValidToLocation ||
      !isValidContent ||
      !isValidTagCount
    ) {
      setCanPost(false);
    }
  }, [isValidFromLocation, isValidToLocation, isValidContent, isValidTagCount]);

  //タグをpostに追加
  useEffect(() => {
    if (tags) {
      setRoadForm({ ...roadForm, tags: [...tags] });
    }
    // eslint-disable-next-line
  }, [tags]);

  /**
   * 経路投稿を行う.
   */
  const handleClickPostBtn = () => {
    setCanPost(false);

    setRoadForm({
      ...roadForm,
      content: roadForm.content.replace("　", " ").trim()
    });

    if (excludedCoordinates) {
      for (let i = 0; i < excludedCoordinates.length; i++) {
        const distance = calculateDistance(
          Math.round(latLng.results[0].geometry.location.lat * 10000000) /
            10000000,
          Math.round(latLng.results[0].geometry.location.lng * 10000000) /
            10000000,
          excludedCoordinates[i].latitude,
          excludedCoordinates[i].longitude
        );
        if (distance > 10) {
          if (i === excludedCoordinates.length - 1) {
            dispatchPostRoad();
          }
        } else {
          setIsOpenedWarningDialog(true);
          break;
        }
      }
    } else {
      dispatchPostRoad();
    }
  };

  /**
   * dispatch(postRoad(roadForm))を実行する.
   */
  const dispatchPostRoad = () => {
    dispatch(
      postRoad({
        postId: location.state.postId,
        roadForm: roadForm
      })
    )
      .then(() => {
        enqueueSnackbar("投稿が完了しました", { variant: "success" });
        history.push({ pathname: Path.map });
      })
      .catch(e => {
        const statusCode = e.message;
        catchUnauthorizedError(statusCode);
        if (statusCode === "400") {
          setIsOpenedWarningDialog(true);
        } else if (statusCode === "403" || statusCode === "422") {
          resetState();
          enqueueSnackbar("投稿に失敗しました", { variant: "error" });
        }
      });
  };

  /**
   * contentが入力されると走る処理.
   *
   * @param event: ChangeEvent<HTMLInputElement>
   */
  const handleChangeContent = (event: ChangeEvent<HTMLInputElement>) => {
    setRoadForm({ ...roadForm, content: event.target.value });

    const inputLength = event.target.value.replace("　", " ").trim().length;
    setContentLength(inputLength);
    if (inputLength === 0 || inputLength > 255) {
      setIsValidContent(false);
    } else {
      setIsValidContent(true);
    }
  };

  /**
   * 各stateを初期値に戻す.
   */
  const resetState = () => {
    setContentLength(0);
    setIsValidContent(null);
    setIsValidToLocation(null);
    setIsValidFromLocation(null);
    setIsValidTagCount(true);

    setRoadForm({
      content: "",
      roadStartSpotName: location.state.fromAddress,
      roadEndSpotName: location.state.toAddress,
      canPostForcibly: false,
      tags: [],
      base64Images: []
    });
  };

  /**
   * 投稿をやめ、地図画面へ遷移する.
   */
  const handleCancel = () => {
    history.push({ pathname: Path.map });
  };

  const fetchLatLng = async (address: string) => {
    const result = await axios.get(GEOCODE_ENDPOINT, {
      params: {
        key: API_KEY,
        address: address,
        language: language
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
        post={roadForm}
        postId={location.state.postId}
        postDispatch={postRoad}
      />
    </>
  );

  if (loadError) return <div>Error</div>;
  if (!isLoaded)
    return (
      <div>
        <CircularProgress />
      </div>
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

          {/*miniMap*/}
          <Grid item className={classes.gridItem}>
            <GoogleMap
              options={mapOptions}
              center={center}
              zoom={16}
              mapContainerStyle={mapContainerStyle}
            >
              <Polyline
                options={{ strokeColor: "magenta" }}
                path={coordinateList}
              />
            </GoogleMap>
          </Grid>

          {/*位置情報入力フォーム*/}
          <Grid item className={classes.gridItem}>
            <Grid container justify={"center"} alignItems={"flex-start"}>
              <Grid item xs={1} className={classes.icon}>
                <Room />
              </Grid>
              <Grid item xs={11}>
                <FromTo
                  fromAddress={location.state.fromAddress}
                  toAddress={location.state.toAddress}
                  setFromAddress={setFromAddress}
                  setToAddress={setToAddress}
                  isValidateFromLocation={isValidFromLocation}
                  isValidateToLocation={isValidToLocation}
                  setIsValidateFromLocation={setIsValidFromLocation}
                  setIsValidateToLocation={setIsValidToLocation}
                />
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
              base64Images={roadForm.base64Images}
              setNewBase64Images={newBase64Images => {
                setRoadForm({ ...roadForm, base64Images: newBase64Images });
              }}
            />
          </Grid>
        </Grid>
      )}
    </div>
  );
};

const postRoadStyles = makeStyles(() => ({
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

export default PostRoad;
