import React, { useState, useEffect } from "react";

import { useDispatch } from "react-redux";
import axios from "axios";
import { AppDispatch } from "~/store";
import { API_KEY } from "~/api.config";
import {
  startRecordRoad,
  setCoordinate
} from "~/store/slice/Domain/post.slice";

import Header from "~/components/elements/other/Header";
import RecordButton from "~/components/posting/roadRecord/RecordButton";
import PostConfirmDialog from "~/components/posting/roadRecord/PostConfirmDialog";
import CurrentPositionButton from "~/components/elements/map/CurrentPositionButton";
import { CURRENT_POSITION_ICON } from "~/utils/globalVariables";
import { Grid, CircularProgress, makeStyles } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";

import {
  GoogleMap,
  useLoadScript,
  Polyline,
  Marker
} from "@react-google-maps/api";

import { useHistory } from "react-router-dom";

// import camelcaseKeys from "camelcase-keys";
import { useSnackbar } from "notistack";

import { DEFAULT_ZOOM_RATE, defaultMapCenter } from "~/utils/globalVariables";
import { useErrorHandle } from "~/utils/useErrorHandle";

import { FOOTER_HEIGHT } from "~/assets/ExportCSS";
import { Path } from "~/router/routes";

type Coordinate = {
  lat: number;
  lng: number;
};

type Position = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

type RoadPath = {
  location: {
    latitude: number;
    longitude: number;
  };
  originalIndex: number;
  placeId: string;
};

const ROADS_API_ENDPOINT = "https://roads.googleapis.com/v1/snapToRoads";
// const geocodeEndPoint = "https://maps.googleapis.com/maps/api/geocode/json";
// const language = "ja";
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false
};

const positionOptions = {
  enableHighAccuracy: true,
  timeout: 600000,
  maximumAge: 0
};

const RoadRecord: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const classes = roadRecordStyle();
  const history = useHistory();
  const [catchUnauthorizedError] = useErrorHandle();
  const { enqueueSnackbar } = useSnackbar();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY
  });

  // component/state
  const [map, setMap] = useState<google.maps.Map>();
  const [center, setCenter] = useState<Coordinate>(defaultMapCenter);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM_RATE);
  const [height, setHeight] = useState("100vh");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedLocation, setRecordedLocation] = useState<Coordinate>();
  const [index, setIndex] = useState(0);
  //40秒ごとに取得した座標のリスト
  const [recordedLocationList, setRecordedLocationList] = useState<
    Array<Coordinate>
  >([]);
  const [recordPosTimerId, setRecordPosTimerId] = useState<NodeJS.Timeout>();
  const [watchId, setWatchId] = useState<number>();
  const [markerPosition, setMarkerPosition] = useState<Coordinate>();
  const [pathData, setPathData] = useState<Array<RoadPath>>();
  //RoadsAPIで補完した座標のリスト
  const [coordinateList, setCoordinateList] = useState<Array<Coordinate>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [postId, setPostId] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [isDuringCountdown, setIsDuringCountdown] = useState(false); // 経路記録残り時間の計算をしているかどうか
  const [countdownTimerId, setCountdownTimerId] = useState<NodeJS.Timeout>();
  const [timeDiffer, setTimeDiffer] = useState<number>(1000); // 残り時間（ms）

  const mapContainerStyle = {
    width: "100vw",
    height: height
  };

  /**
   * 初期表示時に走る処理.
   */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        successCurrentPosition,
        failCurrentPosition,
        positionOptions
      );
      setWatchId(
        navigator.geolocation.watchPosition(
          successMarkerPosition,
          failCurrentPosition,
          positionOptions
        )
      );
    } else {
      window.alert("お使いのブラウザは位置情報の取得に対応していません。");
    }
    return () => {
      setRecordedLocation(undefined);
      setRecordedLocationList([]);
      clearWatchPosition();
    };
    // eslint-disable-next-line
  }, []);

  /**
   * 指定時間ごとに記録された位置情報が更新される度に走る処理.
   * RoadsAPIで補完を行う関数を呼び出し、経過地点をDBに保存する.
   */
  useEffect(() => {
    if (recordedLocation) {
      const locationList = [...recordedLocationList, recordedLocation];
      let stringPath = "";
      locationList.forEach(location => {
        const strLat = String(location.lat);
        const strLng = String(location.lng);
        if (locationList.indexOf(location) === 0) {
          const path = strLat + "," + strLng;
          stringPath = stringPath + path;
        } else {
          const path = "|" + strLat + "," + strLng;
          stringPath = stringPath + path;
        }
      });

      fetchRoads(stringPath);
      dispatch(
        setCoordinate({
          postId: postId,
          latitude: recordedLocation.lat,
          longitude: recordedLocation.lng,
          roadIndex: index
        })
      ).catch(e => {
        if (e.message === "401") {
          catchUnauthorizedError(e.message);
        } else {
          history.push({ pathname: Path.timeline });
          enqueueSnackbar("経路の記録に失敗しました", { variant: "error" });
        }
      });
      setIndex(index + 1);
      setRecordedLocationList(locationList);
    }
    // eslint-disable-next-line
  }, [recordedLocation]);

  /**
   * RoadsAPIによって取得したパスを適切なObjに変換してsetする.
   */
  useEffect(() => {
    let pathList: Array<Coordinate> = [];
    if (pathData) {
      pathData.forEach(path => {
        const pathObj: Coordinate = {
          lat: path.location.latitude,
          lng: path.location.longitude
        };
        pathList = [...pathList, pathObj];
      });
      setCoordinateList(pathList);
    }
    // eslint-disable-next-line
  }, [pathData]);

  /**
   * 経路記録残り時間が１秒を切った時に走る処理.
   */
  useEffect(() => {
    if (timeDiffer < 1000) {
      clearWatchPosition();
      if (recordPosTimerId) {
        clearInterval(recordPosTimerId);
      }
      if (coordinateList.length >= 1) {
        setCenter(coordinateList[0]);
        setFromToAddress();
      }
      if (isDuringCountdown && countdownTimerId !== undefined) {
        clearInterval(countdownTimerId);
      }
      setIsOpen(true);
      setIsRecording(false);
    }
    // eslint-disable-next-line
  }, [timeDiffer]);

  /**
   * startRecordRoad成功後に走る処理.
   */
  useEffect(() => {
    if (postId !== "") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          setCurrentPosition,
          failCurrentPosition,
          positionOptions
        );
      }
      setIndex(index + 1);
    }
    // eslint-disable-next-line
  }, [postId]);

  /**
   * アドレスバーを考慮した高さを設定.
   */
  useEffect(() => {
    setHeight(window.innerHeight - FOOTER_HEIGHT + "px");
  }, []);

  /**
   * roadsAPIで補完したpathを取得する.
   *
   * @param path: パス
   */
  const fetchRoads = async (path: string) => {
    const result = await axios.get(ROADS_API_ENDPOINT, {
      params: {
        key: API_KEY,
        path: path,
        interpolate: true
      }
    });
    setPathData(result.data.snappedPoints);
  };

  /**
   * スタート地点、ゴール地点住所をsetする.
   */
  const setFromToAddress = async () => {
    try {
      const fromAddress = await getAddress(
        coordinateList[0].lat,
        coordinateList[0].lng
      );
      const toAddress = await getAddress(
        coordinateList[coordinateList.length - 1].lat,
        coordinateList[coordinateList.length - 1].lng
      );
      setFromAddress(fromAddress as string);
      setToAddress(toAddress as string);
    } catch (e) {
      // TODO: ちゃんとしたcatchをする.
      console.log("住所を取得することができませんでした。");
    }
  };

  /**
   * geocoding APIを使用し、緯度経度から住所を取得する.
   *
   * @param lat: 緯度
   * @param lng: 経度
   */
  const getAddress = async (lat: number, lng: number) => {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();

      const latLng = new google.maps.LatLng(lat, lng);

      // 緯度経度から住所を取得し、setする
      const req: google.maps.GeocoderRequest = {
        location: latLng
      };

      geocoder.geocode(req, (results, status) => {
        if (status === "OK") {
          resolve(results[0].formatted_address.substr(13));
        } else {
          reject(status);
        }
      });
    });
  };

  /**
   * 初期表示時に現在位置を取得し、centerにsetする.
   *
   * @param position: 位置情報
   */
  const successCurrentPosition = (position: Position) => {
    const positionCoordinate: Coordinate = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    setCenter(positionCoordinate);
  };

  /**
   * 経路記録開始・停止時に走る、位置情報を取得する関数.
   *
   * @param position: 位置情報
   */
  const setCurrentPosition = (position: Position) => {
    const positionCoordinate: Coordinate = roundLatLng(
      position.coords.latitude,
      position.coords.longitude
    );
    setRecordedLocation(positionCoordinate);

    if (!isRecording) {
      // 経路記録を開始する場合
      dispatch(
        setCoordinate({
          postId: postId,
          latitude: positionCoordinate.lat,
          longitude: positionCoordinate.lng,
          roadIndex: index
        })
      ).catch(e => {
        if (e.message === "401") {
          catchUnauthorizedError(e.message);
        } else {
          history.push({ pathname: Path.timeline });
          enqueueSnackbar("経路の記録に失敗しました", { variant: "error" });
        }
      });

      setIndex(index + 1);
    } else {
      // 経路記録を停止する場合
      dispatch(
        setCoordinate({
          postId: postId,
          latitude: positionCoordinate.lat,
          longitude: positionCoordinate.lng,
          roadIndex: recordedLocationList.length + 1
        })
      ).catch(e => {
        if (e.message === "401") {
          catchUnauthorizedError(e.message);
        } else {
          history.push({ pathname: Path.timeline });
          enqueueSnackbar("経路の記録に失敗しました", { variant: "error" });
        }
      });
    }
  };

  /**
   * 現在位置取得失敗時に走る関数.
   */
  const failCurrentPosition = () => {
    window.alert("位置情報の取得に失敗しました。");
  };

  /**
   * 指定時間毎に走る、現在位置を取得する関数.
   *
   * @param position: 位置情報
   */
  const successRecordPosition = (position: Position) => {
    setRecordedLocation(
      roundLatLng(position.coords.latitude, position.coords.longitude)
    );
  };

  /**
   * 現在位置のマーカーを表示させる.
   *
   * @param position: 位置情報
   */
  const successMarkerPosition = (position: Position) => {
    setMarkerPosition({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
  };

  /**
   * 現在位置を取得する.
   * 指定時間ごとに走る.
   */
  const getPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        successRecordPosition,
        failCurrentPosition,
        positionOptions
      );
    } else {
      window.alert("お使いのブラウザは位置情報の取得に対応していません。");
      if (watchId) {
        // TODO
      }
    }
  };

  /**
   * 指定桁数に四捨五入した緯度経度を返す.
   *
   * @param lat: 緯度
   * @param lng: 経度
   */
  const roundLatLng = (lat: number, lng: number) => {
    return {
      lat: Math.round(lat * 10000000) / 10000000,
      lng: Math.round(lng * 10000000) / 10000000
    };
  };

  /**
   * 経路記録開始・停止ボタンを押した際に走る処理.
   */
  const handleClickRecordBtn = async () => {
    // if (isDuringCountdown) {
    //   let minTag = document.getElementById("min") as HTMLElement;
    //   let secTag = document.getElementById("sec") as HTMLElement;
    //   minTag.textContent = "00";
    //   secTag.textContent = "00";
    // }
    setIsDuringCountdown(!isDuringCountdown);

    if (!isRecording) {
      // 経路記録を開始する場合
      await dispatch(startRecordRoad())
        .then(() => {
          if (typeof localStorage.getItem("postId")) {
            const id = localStorage.getItem("postId");
            if (typeof id === "string") {
              setPostId(id);
            }
            localStorage.removeItem("postId");
          }
        })
        .catch(e => {
          if (e.message === "401") {
            catchUnauthorizedError(e.message);
          } else {
            history.push({ pathname: Path.timeline });
            enqueueSnackbar("経路の記録に失敗しました", { variant: "error" });
          }
        });

      const startTime = new Date();
      const endTime = new Date(
        startTime.getFullYear(),
        startTime.getMonth(),
        startTime.getDate(),
        startTime.getHours() + 1,
        startTime.getMinutes(),
        startTime.getSeconds()
      );

      ///// 残り時間を計算する関数 /////
      const calculateTime = () => {
        const nowTime = new Date();

        // 残り時間(ms)の算出
        const differ = endTime.getTime() - nowTime.getTime();
        setTimeDiffer(differ);

        // remainingTime JSXに反映
        const sec = Math.floor(differ / 1000) % 60;
        const min = Math.floor(differ / 1000 / 60) % 60;
        let minTag = document.getElementById("min") as HTMLElement;
        let secTag = document.getElementById("sec") as HTMLElement;
        minTag.textContent = String(min).padStart(2, "0");
        secTag.textContent = String(sec).padStart(2, "0");
      };

      if (!isDuringCountdown) {
        // カウントダウンを行っていない場合、カウントダウンを開始する
        setCountdownTimerId(setInterval(calculateTime, 1000));
      }

      // 40秒ごとに現在位置を取得する処理を開始する
      setRecordPosTimerId(setInterval(getPosition, 40000));
    } else {
      // 経路記録を停止する場合
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          setCurrentPosition,
          failCurrentPosition,
          positionOptions
        );
      }

      clearWatchPosition();

      // 10秒ごとに現在位置を取得する処理を停止する
      if (recordPosTimerId) {
        clearInterval(recordPosTimerId);
      }

      // 経路が記録されている場合、スタート地点、ゴール地点の住所を取得する
      if (coordinateList.length >= 1) {
        await setFromToAddress();
      }

      // カウントダウンを停止する
      if (isDuringCountdown && countdownTimerId !== undefined) {
        clearInterval(countdownTimerId);
      }

      // 投稿確認ダイアログを開く
      setIsOpen(true);
    }

    setIsRecording(!isRecording);
  };

  /**
   * 現在位置の監視を停止する.
   */
  const clearWatchPosition = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  };

  /**
   * zoom率が変更された際に走る処理.
   * component/state zoomにsetする.
   */
  const handleZoomChanged = () => {
    if (map) {
      setZoom(map.getZoom());
    }
  };

  /**
   * mapが読み込まれる際に走る処理.
   *
   * @param map
   */
  const handleLoadMap = (map: google.maps.Map) => {
    setMap(map);
  };

  /**
   * 現在位置取得時にズーム率をデフォルト値に、centerが現在位置になるようにする.
   */
  const handleSearchMap = (lat: number, lng: number) => {
    setZoom(DEFAULT_ZOOM_RATE);

    const latLng = new google.maps.LatLng(lat, lng);

    // mapを移動させる
    map!.panTo(latLng);

    setCenter({ lat: lat, lng: lng });
  };

  const resetTime = () => {
    let minTag = document.getElementById("min") as HTMLElement;
    let secTag = document.getElementById("sec") as HTMLElement;
    minTag.textContent = "00";
    secTag.textContent = "00";
  };

  // 経路記録残り時間
  const remainingTime = (
    <div>
      <span>経路記録終了まで</span>
      <span id="min">00</span>分<span id="sec">00</span>秒
    </div>
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
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        options={mapOptions}
        zoom={zoom}
        center={center}
        onLoad={handleLoadMap}
        onZoomChanged={handleZoomChanged}
      >
        <Marker
          position={markerPosition ? markerPosition : center}
          icon={{
            url: CURRENT_POSITION_ICON,
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(15, 15),
            scaledSize: new window.google.maps.Size(20, 20)
          }}
        />
        <Polyline options={{ strokeColor: "magenta" }} path={coordinateList} />
      </GoogleMap>

      {/*Header*/}
      <div className={classes.headerDiv}>
        <Header first={1} middle={remainingTime} last={null} />
      </div>

      {/*投稿開始・停止ボタン*/}
      <Grid container justify={"flex-start"} className={classes.recordButton}>
        <Grid item>
          <IconButton onClick={handleClickRecordBtn}>
            <RecordButton isRecoding={isRecording} />
          </IconButton>
        </Grid>
      </Grid>

      {/*現在位置ボタン*/}
      <Grid
        container
        justify={"flex-start"}
        alignItems={"center"}
        className={classes.currentPositionButton}
      >
        <Grid item>
          <CurrentPositionButton setCenter={handleSearchMap} />
        </Grid>
      </Grid>

      {/*投稿確認ダイアログ*/}
      <PostConfirmDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        coordinateList={coordinateList}
        postId={postId}
        fromAddress={fromAddress}
        toAddress={toAddress}
        resetTime={resetTime}
      />
    </div>
  );
};

const roadRecordStyle = makeStyles(() => ({
  headerDiv: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%"
  },
  currentPositionButton: {
    position: "fixed",
    bottom: "10vh",
    left: "80vw",
    zIndex: 1
  },
  recordButton: {
    position: "absolute",
    top: "8vh",
    left: "1vw"
  }
}));

export default RoadRecord;
