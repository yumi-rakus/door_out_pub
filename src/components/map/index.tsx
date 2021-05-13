import React, { useEffect, useState } from "react";

import { AppDispatch } from "~/store";
import { API_KEY, LIBRARIES } from "~/api.config";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPostCoordinates,
  RangeParam,
  selectPostCoordinates,
  setPostIds,
  setTimelineBottomTabId,
  setTimelinePlaceName,
  setTimelineTopTabId
} from "~/store/slice/Domain/post.slice";
import {
  selectCenter,
  setCenter as setStoreCenter
} from "~/store/slice/Domain/map.slice";

import Header from "~/components/elements/other/Header";
import PostCluster from "~/components/map/PostClusterer";
import SpotPostMarker from "~/components/map/SpotPostMarker";
import RoadPostMarker from "~/components/map/RoadPostMarker";
import SearchLocationForm from "~/components/elements/map/SearchLocationForm";
import CurrentPositionButton from "~/components/elements/map/CurrentPositionButton";
import { Button, CircularProgress, Grid } from "@material-ui/core";

import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript
} from "@react-google-maps/api";
import { useSnackbar } from "notistack";

import { useHistory, useLocation } from "react-router-dom";
import { Path } from "~/router/routes";

import { useErrorHandle } from "~/utils/useErrorHandle";
import {
  DEFAULT_ZOOM_RATE,
  defaultMapCenter,
  GEOCODE_URL,
  GOOGLE_MAP_URL,
  LOCATION_INFO_NOT_ACTIVE_MSG,
  INVALID_POST_SPOT_MSG
} from "~/utils/globalVariables";
import { FOOTER_HEIGHT } from "~/assets/ExportCSS";

import { Coordinate } from "~/interfaces";

export type SpotPostData = {
  postType: 1;
  lat: number;
  lng: number;
  spotName: string;
};
export type RoadPostData = {
  postType: 2;
  // encodedPolyline: string;
  startRoadSpotName: string;
  endRoadSpotName: string;
  path: Array<Coordinate>;
};

const Map: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const location = useLocation<SpotPostData | RoadPostData>();
  const [catchUnauthorizedError] = useErrorHandle();
  const { enqueueSnackbar } = useSnackbar();

  // store/state
  const storeCenter = useSelector(selectCenter);
  const postCoordinates = useSelector(selectPostCoordinates);

  // component/state
  const [map, setMap] = useState<google.maps.Map<Element>>();
  const [center, setCenter] = useState<Coordinate>();
  const [zoomRate, setZoomRate] = useState(DEFAULT_ZOOM_RATE);
  const [size, setSize] = useState<undefined | google.maps.Size>(undefined);
  const [spotPostData, setSpotPostData] = useState<SpotPostData>();
  const [roadPostData, setRoadPostData] = useState<RoadPostData>();
  const [clickedPosition, setClickedPosition] = useState<Coordinate>();
  const [markerInfoWindow, setMarkerInfoWindow] = useState<Coordinate>();
  const [googleMapURL, setGoogleMapURL] = useState("");
  const [height, setHeight] = useState("10vh");
  const [isLocationActive, setIsLocationActive] = useState(false);

  // 定数
  const BASE = 1000000;

  useEffect(() => {
    if (location.state) {
      if (location.state.postType === 1) {
        setCenter({ lat: location.state.lat, lng: location.state.lng });
        setSpotPostData(location.state);
      } else {
        const path = location.state.path;
        setCenter({ lat: path[0].lat, lng: path[0].lng });
        setRoadPostData(location.state);
      }
    } else {
      if (storeCenter.lat === null || storeCenter.lng === null) {
        moveToCurrentPosition();
      } else {
        setCenter({ lat: storeCenter.lat, lng: storeCenter.lng });
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //center値が変わるたびにfetchPostCoordinatesアクションを実行
  useEffect(() => {
    if (map?.getBounds()) {
      // ↓末尾の「 || 1 」はtopRigintLatにundefinedを入れないための苦渋のコードです・・・
      const topRightLatitude = map?.getBounds()?.getNorthEast().lat() || 1;
      const topRightLongitude = map?.getBounds()?.getNorthEast().lng() || 1;
      const bottomLeftLatitude = map?.getBounds()?.getSouthWest().lat() || 1;
      const bottomLeftLongitude = map?.getBounds()?.getSouthWest().lng() || 1;
      const rangePram: RangeParam = {
        topRightLatitude: Math.floor(topRightLatitude * BASE) / BASE,
        topRightLongitude: Math.floor(topRightLongitude * BASE) / BASE,
        bottomLeftLatitude: Math.floor(bottomLeftLatitude * BASE) / BASE,
        bottomLeftLongitude: Math.floor(bottomLeftLongitude * BASE) / BASE,
        limit: 100,
        offset: 0
      };
      dispatch(fetchPostCoordinates(rangePram)).catch(e =>
        catchUnauthorizedError(e.message)
      );
    } else {
      if (center) {
        const latDifference = 0.088435;
        const lngDifference = 0.06437;
        const rangePram: RangeParam = {
          topRightLatitude:
            Math.floor((center.lat + latDifference) * BASE) / BASE,
          topRightLongitude:
            Math.floor((center.lng + lngDifference) * BASE) / BASE,
          bottomLeftLatitude:
            Math.floor((center.lat - latDifference) * BASE) / BASE,
          bottomLeftLongitude:
            Math.floor((center.lng - lngDifference) * BASE) / BASE,
          limit: 100,
          offset: 0
        };
        dispatch(fetchPostCoordinates(rangePram)).catch(e =>
          catchUnauthorizedError(e.message)
        );
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center]);

  useEffect(() => {
    setHeight(window.innerHeight - FOOTER_HEIGHT + "px");
  }, []);

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false
  };

  const mapContainerStyle = {
    width: "100vw",
    height: height
  };

  const infoWindowOptions = {
    pixelOffset: size,
    visible: false
  };

  const createOffsetSize = () => {
    return setSize(new window.google.maps.Size(0, -45));
  };

  const moveToCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const data = position.coords;
        const currentLocation: Coordinate = {
          lat: data.latitude,
          lng: data.longitude
        };
        setCenter(currentLocation);
        setIsLocationActive(true);
        dispatch(setStoreCenter(currentLocation));
      },
      () => {
        setCenter(defaultMapCenter);
        setIsLocationActive(false);
        enqueueSnackbar(LOCATION_INFO_NOT_ACTIVE_MSG, { variant: "warning" });
      }
    );
  };

  const handleLoadMap = (map: google.maps.Map<Element>) => {
    setMap(map);
    setZoomRate(map.getZoom());
    createOffsetSize();
  };
  const handleZoomChanged = () => {
    if (map) {
      setClickedPosition(undefined);
      setMarkerInfoWindow(undefined);
      map && setZoomRate(map.getZoom());
      const center: Coordinate = {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng()
      };
      setCenter(center);
    }
  };

  const handleDragStart = () => {
    setClickedPosition(undefined);
    setMarkerInfoWindow(undefined);
  };

  const handleDragEnd = () => {
    if (map) {
      const center: Coordinate = {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng()
      };
      setCenter(center);
      dispatch(setStoreCenter(center));
    }
  };

  /**
   * 地図の何も無いところをクリックした際に呼び出される関数
   * クリックした地点にマーカーを表示する
   */
  const handleClickMap = (e: google.maps.MapMouseEvent) => {
    const clickedCoordinate: Coordinate = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setClickedPosition(undefined);
    setMarkerInfoWindow(undefined);
    setClickedPosition(clickedCoordinate);
  };

  /**
   * 上記で立てたマーカーをクリックした際に呼び出される関数
   * マーカーの上にInfoWindowを表示する
   */
  const handleClickMarker = (e: google.maps.MapMouseEvent) => {
    const clickedCoordinate: Coordinate = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setMarkerInfoWindow(clickedCoordinate);
    setDestination();
  };

  /**
   * InfoWindow内の「投稿をみる」をクリックした際に呼び出される関数
   * 一覧画面に遷移する
   */
  const goToTimelinePage = async () => {
    const postIds: any = postCoordinates.map(coordinate => ({
      postId: coordinate.postId,
      roadIndex: coordinate.roadIndex
    }));
    dispatch(setPostIds(postIds));
    const placeName = await fetchPlaceName();
    dispatch(setTimelineTopTabId(2));
    dispatch(setTimelineBottomTabId(2));
    dispatch(setTimelinePlaceName(placeName));
    history.push({ pathname: Path.timeline, state: { needFetch: true } });
  };

  /**
   * InfoWindow内の「投稿する」ボタンをクリックした際に呼び出される関数
   * マーカーの緯度経度情報をstateに入れて投稿画面に遷移する
   */
  const goToPostingPage = async () => {
    const spotName = await fetchPlaceNameForPosting();
    if (spotName) {
      history.push({
        pathname: Path.postSpot,
        state: { spotName: spotName }
      });
    } else {
      enqueueSnackbar(INVALID_POST_SPOT_MSG);
    }
  };

  /**
   * 『投稿する』ボタンを押下した際にclickした地点の場所名情報を取得して戻り値として返す関数
   * @returns GeocodingAPIから取得した場所名情報
   */
  const fetchPlaceNameForPosting = async () => {
    return await axios
      .get(GEOCODE_URL, {
        params: {
          latlng: `${clickedPosition?.lat}, ${clickedPosition?.lng}`,
          key: API_KEY,
          result_type: "premise"
        }
      })
      .then(res => {
        const formattedAddress = res.data.results[0]?.formatted_address;
        if (formattedAddress) {
          const addressWithoutJapan = formattedAddress.replace("日本、", "");
          const startIndex = addressWithoutJapan.indexOf(" ") + 1;
          return addressWithoutJapan.substring(
            startIndex,
            addressWithoutJapan.length
          );
        }
        return null;
      });
  };

  /**
   * clickした地点の場所名情報を取得して戻り値として返す関数
   * @returns GeocodingAPIから取得した場所名情報
   */
  const fetchPlaceName = async () => {
    return await axios
      .get(GEOCODE_URL, {
        params: {
          latlng: `${clickedPosition?.lat}, ${clickedPosition?.lng}`,
          key: API_KEY,
          result_type: "locality"
        }
      })
      .then(res => {
        const address: any[] = res.data.results[0].address_components;
        address.splice(address.length - 1, 1);
        const reverseAddress = address.reverse();
        let placeName = "";
        reverseAddress.map(add => (placeName += add.long_name));
        return placeName;
      });
  };

  /**
   * InfoWindow内の「目的地に設定」ボタンをクリックした際に呼び出される関数
   * 現在地からの経路として外部のGoogleMapが別タブで開かれる
   */
  const setDestination = () => {
    const url = new URL(GOOGLE_MAP_URL);
    url.searchParams.append("api", "1");
    navigator.geolocation.getCurrentPosition(currentPosition => {
      const currentLat = currentPosition.coords.latitude;
      const currentLng = currentPosition.coords.longitude;
      url.searchParams.append("origin", `${currentLat}, ${currentLng}`);
      url.searchParams.append("destination", `${center?.lat},${center?.lng}`);
      // window.open(url.href);
      setGoogleMapURL(url.href);
    });
  };

  /**
   * 現在位置取得、場所検索時にMarkerを立てる.
   */
  const setSearchPosition = (lat: number, lng: number) => {
    // 各stateの初期化
    setClickedPosition(undefined);
    setZoomRate(DEFAULT_ZOOM_RATE);

    // 取得した緯度経度
    const position: Coordinate = {
      lat: lat,
      lng: lng
    };

    const latLng = new google.maps.LatLng(lat, lng);

    // mapを移動させる
    map!.panTo(latLng);

    // marker, infoWindowを立てる
    // ※ setTimeoutは、少し遅らせないとpanToでのなめらかな移動ができなかったため
    setTimeout(() => {
      setClickedPosition(position);
      setCenter(position);
    }, 300);
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES
  });

  if (loadError) return <div>Error</div>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <>
      <Header first={1} middle={1} last={null} />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        options={mapOptions}
        onLoad={handleLoadMap}
        onZoomChanged={handleZoomChanged}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClickMap}
        center={center}
        zoom={zoomRate}
      >
        {/* クラスター */}
        {postCoordinates && (
          <PostCluster
            postCoordinates={postCoordinates}
            zoomRate={zoomRate}
            closeClickedPositionMarker={setClickedPosition}
            closeMarkerInfoWindow={setMarkerInfoWindow}
          />
        )}

        {/* 地点投稿のマーカー */}
        {spotPostData && (
          <SpotPostMarker
            zoomRate={zoomRate}
            mapSize={size}
            spotPostData={spotPostData}
            isLocationActive={isLocationActive}
          />
        )}

        {/* 経路投稿マーカー */}
        {roadPostData && (
          <RoadPostMarker
            roadPostData={roadPostData}
            mapSize={size}
            zoomRate={zoomRate}
          />
        )}

        {/* 何も無いところをクリックした際のマーカーとInfoWindow */}
        {clickedPosition && (
          <Marker
            position={clickedPosition}
            animation={google.maps.Animation.DROP}
            onClick={handleClickMarker}
          />
        )}
        {markerInfoWindow && zoomRate >= 11 && (
          <InfoWindow
            options={infoWindowOptions}
            position={markerInfoWindow}
            onCloseClick={() => setMarkerInfoWindow(undefined)}
          >
            <>
              {postCoordinates.length > 0 ? (
                <>
                  <Button color="primary" onClick={goToTimelinePage}>
                    表示範囲内の投稿({postCoordinates.length}件)をみる
                  </Button>
                  <br />
                </>
              ) : (
                <span>表示範囲内に投稿はありません</span>
              )}
              <Grid container>
                <Grid item xs={5}>
                  <Button
                    color="secondary"
                    variant="contained"
                    size="small"
                    onClick={goToPostingPage}
                  >
                    投稿する
                  </Button>
                </Grid>
                <Grid item xs={7}>
                  <Button variant="contained" size="small" color="primary">
                    {isLocationActive ? (
                      <a
                        href={googleMapURL}
                        rel="noopener noreferrer"
                        target={"_blank"}
                        style={{ color: "white", textDecoration: "none" }}
                      >
                        目的地に設定
                      </a>
                    ) : (
                      <span
                        onClick={() =>
                          enqueueSnackbar(LOCATION_INFO_NOT_ACTIVE_MSG, {
                            variant: "error"
                          })
                        }
                      >
                        目的地に設定
                      </span>
                    )}
                  </Button>
                </Grid>
              </Grid>
            </>
          </InfoWindow>
        )}
      </GoogleMap>
      <Grid
        container
        justify={"flex-start"}
        alignItems={"center"}
        style={{
          position: "absolute",
          top: "7vh"
        }}
      >
        <Grid item xs={8}>
          <SearchLocationForm
            handleLocationSearch={(lat, lng) => {
              setSearchPosition(lat, lng);
            }}
          />
        </Grid>
      </Grid>

      <Grid
        container
        justify={"flex-start"}
        alignItems={"center"}
        style={{
          position: "fixed",
          bottom: "10%",
          left: "80vw"
        }}
      >
        <Grid item>
          <CurrentPositionButton
            setCenter={(lat, lng) => {
              setSearchPosition(lat, lng);
              dispatch(
                setStoreCenter({
                  lat: lat,
                  lng: lng
                })
              );
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default Map;
