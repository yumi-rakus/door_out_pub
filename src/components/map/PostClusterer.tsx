import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

import axios from "axios";
import Button from "@material-ui/core/Button";
import { MarkerClusterer, InfoWindow, Marker } from "@react-google-maps/api";

import { Path } from "~/router/routes";
import {
  setPostIds,
  setTimelineBottomTabId,
  setTimelinePlaceName,
  setTimelineTopTabId
} from "~/store/slice/Domain/post.slice";
import { GEOCODE_URL } from "~/utils/globalVariables";
import { API_KEY } from "~/api.config";
import { PostCoordinate } from "~/interfaces";

type Prop = {
  postCoordinates: Array<PostCoordinate>;
  zoomRate: number;
  closeClickedPositionMarker: (arg: undefined) => void;
  closeMarkerInfoWindow: (arg: undefined) => void;
};
type InfoWindowType = {
  lat: number;
  lng: number;
  postCounts: number;
};
type Bounds = {
  topLag: number;
  bottomLag: number;
  leftLng: number;
  rightLng: number;
};

const PostCluster: React.FC<Prop> = ({
  postCoordinates,
  zoomRate,
  closeClickedPositionMarker,
  closeMarkerInfoWindow
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [infoWindow, setInfoWindow] = useState<InfoWindowType>();
  const [clickedClusterBounds, setClickedClusterBounds] = useState<Bounds>();

  const clusterOptions = {
    averageCenter: true,
    minimumClusterSize: 3,
    maxZoom: 22,
    gridSize: zoomRate >= 14 ? 500 : 100
  };

  //ズーム率が変わる度にInfoWindowを閉じる。
  useEffect(() => {
    setInfoWindow(undefined);
  }, [zoomRate]);

  /**
   * クラスターをクリックした際に呼び出される関数
   * InfoWindowの適切な表示箇所情報をsteteにセット
   * そのクラスターの範囲を取得してstateにセット
   */
  const handleClickCluster = (cluster: any) => {
    closeClickedPositionMarker(undefined);
    closeMarkerInfoWindow(undefined);
    const latLng = cluster.getCenter();
    const bounds = cluster.getBounds().toJSON();
    const infoWindow: InfoWindowType = {
      lat: latLng.lat(),
      lng: latLng.lng(),
      postCounts: cluster.getMarkers().length
    };
    const clusterBounds: Bounds = {
      topLag: bounds.north,
      bottomLag: bounds.south,
      leftLng: bounds.west,
      rightLng: bounds.east
    };
    setClickedClusterBounds(clusterBounds);
    //↓ InfoWindow内右上の×アイコンを押下してウィンドウを閉じなかった場合、一度undefinedにしてからでないと再度開けなくなるため。
    setInfoWindow(undefined);
    setInfoWindow(infoWindow);
  };

  /**
   * InfoWindow内の『投稿をみる』ボタンをクリックした際に呼び出される関数
   * 画面範囲内の全投稿から 選択したクラスター範囲内の投稿を抽出取得して、一覧画面に遷移
   */
  const goToTimelinePage = async () => {
    if (clickedClusterBounds) {
      const { topLag, bottomLag, leftLng, rightLng } = clickedClusterBounds;

      const postIds = postCoordinates
        .filter(
          coordinate =>
            topLag >= coordinate.latitude &&
            coordinate.latitude >= bottomLag &&
            rightLng >= coordinate.longitude &&
            coordinate.longitude >= leftLng
        )
        .map(coordinate => ({
          postId: coordinate.postId,
          roadIndex: coordinate.roadIndex
        }));
      dispatch(setPostIds(postIds));
      const resData = await axios
        .get(GEOCODE_URL, {
          params: {
            latlng: `${infoWindow?.lat}, ${infoWindow?.lng}`,
            key: API_KEY,
            result_type: "locality"
          }
        })
        .then(res => res.data);
      const address: any[] = resData.results[0].address_components;
      address.splice(address.length - 1, 1);
      const reverseAddress = address.reverse();
      let placeName = "";
      reverseAddress.map(add => (placeName += add.long_name));
      dispatch(setTimelineTopTabId(2));
      dispatch(setTimelineBottomTabId(2));
      dispatch(setTimelinePlaceName(placeName));

      history.push({
        pathname: Path.timeline,
        state: { needFetch: true }
      });
    }
  };
  return (
    <>
      <MarkerClusterer
        options={clusterOptions}
        onClick={handleClickCluster}
        zoomOnClick={zoomRate >= 8 ? false : true}
      >
        {clusterer =>
          postCoordinates.map((post, i) => (
            <Marker
              visible={false}
              key={i}
              clusterer={clusterer}
              position={{
                lat: post.latitude,
                lng: post.longitude
              }}
            />
          ))
        }
      </MarkerClusterer>
      {infoWindow && zoomRate > 8 ? (
        <InfoWindow
          position={infoWindow}
          onCloseClick={() => setInfoWindow(undefined)}
        >
          <Button color="primary" onClick={goToTimelinePage}>
            この地域の
            <br />
            投稿 ({infoWindow.postCounts}件)をみる
          </Button>
        </InfoWindow>
      ) : null}
    </>
  );
};

export default PostCluster;
