import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import {
  addExcludedCoordinate,
  fetchExcludedCoordinates,
  selectExcludedCoordinates
} from "~/store/slice/Domain/excludedCoordinate.slice";

import SearchLocationForm from "~/components/elements/map/SearchLocationForm";
import CurrentPositionButton from "~/components/elements/map/CurrentPositionButton";
import Header from "~/components/elements/other/Header";
import {
  Grid,
  makeStyles,
  Typography,
  TextField,
  Button
} from "@material-ui/core";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript
} from "@react-google-maps/api";
import { API_KEY, LIBRARIES } from "~/api.config";

import { useErrorHandle } from "~/utils/useErrorHandle";
import {
  DEFAULT_ZOOM_RATE,
  defaultMapCenter,
  LOCATION_INFO_NOT_ACTIVE_MSG
} from "~/utils/globalVariables";

import { useSnackbar } from "notistack";

import HeaderStyle from "~/assets/css/Header.module.css";
import { HEADER_HEIGHT } from "~/assets/ExportCSS";

import { Coordinate, ExcludedCoordinate } from "~/interfaces";

const AddExcludedCoordinate: React.FC = () => {
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
  const exCds = useSelector(selectExcludedCoordinates);

  // component/state
  const [map, setMap] = useState<google.maps.Map>();
  const [center, setCenter] = useState<Coordinate>();
  const [zoom, setZoom] = useState(DEFAULT_ZOOM_RATE);
  const [height, setHeight] = useState("100vh");
  const [clickedPosition, setClickedPosition] = useState<Coordinate>();
  const [pixelOffset, setPixelOffset] = useState<google.maps.Size>();
  const [address, setAddress] = useState("");
  const [placeName, setPlaceName] = useState("");

  // map option & style
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: false
  };

  const mapContainerStyle = {
    width: "100vw",
    height: height
  };

  // info window option
  const infoWindowOptions: google.maps.InfoWindowOptions = {
    pixelOffset: pixelOffset
  };

  /**
   * ※ URL直打ち対策
   * 投稿回避地点が5つ登録されていたら投稿回避地点編集画面に遷移する.
   */
  useEffect(() => {
    if (!exCds) {
      dispatch(fetchExcludedCoordinates()).catch(e => {
        catchUnauthorizedError(e.message);
        if (e.message === "404") history.go(0);
      });
    } else {
      if (exCds.length >= 5) {
        history.push({ pathname: Path.editExcludedCoordinates });
      }
    }
  }, [catchUnauthorizedError, dispatch, exCds, history]);

  /**
   * アドレスバーを考慮した高さを設定.
   */
  useEffect(() => {
    setHeight(window.innerHeight + "px");
  }, []);

  /**
   * 初期表示時にmapのcenterを現在位置にする.
   */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const data = position.coords;
        const currentPosition: Coordinate = {
          lat: data.latitude,
          lng: data.longitude
        };
        setCenter(currentPosition);
      },
      () => {
        setCenter(defaultMapCenter);
        enqueueSnackbar(LOCATION_INFO_NOT_ACTIVE_MSG);
      }
    );
  }, [enqueueSnackbar]);

  // ---------------------- methods ----------------------

  /**
   * geocoding APIを使用し、緯度経度から住所を取得する.
   *
   * @param req: 緯度経度
   */
  const getAddress = async (req: google.maps.GeocoderRequest) => {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(req, (results, status) => {
        if (status === "OK") {
          resolve(results[0].formatted_address.replace(/^日本、/, ""));
        } else {
          reject(status);
        }
      });
    });
  };

  /**
   * mapが読み込まれる際に走る処理.
   * infoWindowのoption pixelOffsetをsetする.
   *
   * @param map
   */
  const handleLoadMap = (map: google.maps.Map) => {
    setMap(map);
    setPixelOffset(new window.google.maps.Size(0, -45));
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
   * marker、infoWindowを表示する
   *
   * @param lat: 緯度
   * @param lng: 経度
   */
  const displayMarkerAndInfoWindow = async (lat: number, lng: number) => {
    // 各stateの初期化
    setClickedPosition(undefined);
    setAddress("");
    setPlaceName("");

    // clickした位置の緯度経度
    const position: Coordinate = {
      lat: lat,
      lng: lng
    };

    const latLng = new google.maps.LatLng(lat, lng);

    // mapを移動させる
    map!.panTo(latLng);

    // 緯度経度から住所を取得し、setする
    const req: google.maps.GeocoderRequest = {
      location: latLng
    };
    try {
      const result = await getAddress(req);
      setAddress(result as string);

      // marker, infoWindowを立てる
      // ※ setTimeoutは、少し遅らせないとpanToでのなめらかな移動ができなかったため
      setTimeout(() => {
        setClickedPosition(position);
      }, 300);
    } catch (e) {
      setAddress("");
    }
  };

  /**
   * mapをクリックしたら、marker、infoWindowを表示する.
   *
   * @param e: google.maps.MapMouseEvent
   */
  const handleClickMap = async (e: google.maps.MapMouseEvent) => {
    await displayMarkerAndInfoWindow(e.latLng.lat(), e.latLng.lng());
  };

  /**
   * mapを検索または現在位置ボタンを押し、marker、infoWindowを表示する.
   *
   * @param lat: 緯度
   * @param lng: 経度
   */
  const handleSearchMap = async (lat: number, lng: number) => {
    setZoom(DEFAULT_ZOOM_RATE);
    await displayMarkerAndInfoWindow(lat, lng);
  };

  /**
   * 回避地点に登録する.
   * 登録が成功したら、投稿回避地点編集画面に遷移する.
   */
  const handleClickAddButton = () => {
    const addExCd: ExcludedCoordinate = {
      latitude: Math.round(clickedPosition!.lat * 10000000) / 10000000,
      longitude: Math.round(clickedPosition!.lng * 10000000) / 10000000,
      address: address,
      placeName: placeName.replace("　", " ").trim()
    };
    dispatch(addExcludedCoordinate(addExCd))
      .then(() => {
        history.push({ pathname: Path.editExcludedCoordinates });
      })
      .catch(e => {
        const statusCode = e.message;
        catchUnauthorizedError(statusCode);
        if (statusCode === "400" || statusCode === "422") {
          enqueueSnackbar(
            "投稿回避地点登録に失敗しました。申し訳ございませんが、再度お試しください。",
            { variant: "error" }
          );
          history.push({ pathname: Path.editExcludedCoordinates });
        }
      });
  };

  /**
   * 投稿回避地点登録をキャンセルし、投稿回避地点編集画面に戻る.
   */
  const handleClickCancel = () => {
    history.push({ pathname: Path.editExcludedCoordinates });
  };

  // ---------------------- Header JSX Element ----------------------

  const cancelBtn = (
    <Typography className={HeaderStyle.cancel} onClick={handleClickCancel}>
      キャンセル
    </Typography>
  );

  if (loadError) {
    history.push({ pathname: Path.editExcludedCoordinates });
  }

  return (
    <div>
      {!isLoaded ? null : (
        <GoogleMap
          options={mapOptions}
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onClick={handleClickMap}
          onLoad={handleLoadMap}
          onZoomChanged={handleZoomChanged}
        >
          {clickedPosition && (
            <div>
              <Marker
                position={clickedPosition}
                animation={google.maps.Animation.DROP}
              />

              <InfoWindow
                options={infoWindowOptions}
                position={clickedPosition}
              >
                <Grid
                  container
                  justify={"center"}
                  alignItems={"center"}
                  direction={"column"}
                >
                  <Grid item>{address}</Grid>
                  <Grid item>
                    <Grid container justify={"center"} alignItems={"center"}>
                      <Grid item xs={3}>
                        場所名:
                      </Grid>
                      <Grid item xs={9}>
                        <TextField
                          variant={"outlined"}
                          value={placeName}
                          onChange={e => {
                            setPlaceName(e.target.value);
                          }}
                          label={"例)自宅"}
                          size={"small"}
                          className={classes.textField}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid>
                    <Button
                      variant={"contained"}
                      color={"primary"}
                      onClick={handleClickAddButton}
                      size={"small"}
                      className={classes.addButton}
                    >
                      回避地点に登録
                    </Button>
                  </Grid>
                </Grid>
              </InfoWindow>
            </div>
          )}
        </GoogleMap>
      )}

      {/*Header*/}
      <div className={classes.headerDiv}>
        <Header first={cancelBtn} middle={null} last={null} />
      </div>

      {/*検索ボックス*/}
      <Grid
        container
        justify={"flex-start"}
        alignItems={"center"}
        className={classes.searchLocationForm}
      >
        <Grid item xs={8} style={{ marginTop: "1vh" }}>
          <SearchLocationForm handleLocationSearch={handleSearchMap} />
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
    </div>
  );
};

const useStyles = makeStyles(() => ({
  headerDiv: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%"
  },
  searchLocationForm: {
    position: "absolute",
    top: HEADER_HEIGHT
  },
  currentPositionButton: {
    position: "fixed",
    bottom: "2vh",
    left: "80vw"
  },
  textField: {
    marginTop: "5%"
  },
  addButton: {
    marginTop: "10%"
  }
}));

export default AddExcludedCoordinate;