import React, { useState, useEffect } from "react";

import Button from "@material-ui/core/Button";
import { Polyline, InfoWindow, Marker } from "@react-google-maps/api";

import { RoadPostData } from "~/components/map";
import { Coordinate } from "~/interfaces";
import routeStartMarker from "~/assets/RouteMarker.png";
import { GOOGLE_MAP_URL } from "~/utils/globalVariables";

type Prop = {
  zoomRate: number;
  mapSize: google.maps.Size | undefined;
  roadPostData: RoadPostData;
};

const RoadPostMarker: React.FC<Prop> = ({
  roadPostData,
  zoomRate,
  mapSize
}) => {
  const [infoWindow, setInfoWindow] = useState<Coordinate>();
  const [googleMapURL, setGoogleMapURL] = useState("");

  const infoWindowOptions = {
    pixelOffset: mapSize,
    visible: false
  };

  //ズーム率が11より下がった場合、InfoWindowを閉じる。
  useEffect(() => {
    zoomRate < 11 && setInfoWindow(undefined);
  }, [zoomRate]);

  /**
   *経路投稿開始地点のマーカーをクリックした際に呼び出される関数
   *InfoWindowを適切な位置に表示するためのstateにセット
   */
  const handleClickRoadMarker = () => {
    const coordinate: Coordinate = {
      lat: roadPostData.path[0].lat,
      lng: roadPostData.path[0].lng
    };
    setInfoWindow(coordinate);
  };

  useEffect(() => {
    const url = new URL(GOOGLE_MAP_URL);
    url.searchParams.append("api", "1");
    const lastIndex = roadPostData.path.length - 1;
    let wayPoints = "";
    for (let i = 1; i < lastIndex; i++) {
      wayPoints += `${roadPostData.path[i].lat},${roadPostData.path[i].lng}|`;
    }
    url.searchParams.append(
      "origin",
      `${roadPostData.path[0].lat},${roadPostData.path[0].lng}`
    );
    url.searchParams.append(
      "destination",
      `${roadPostData.path[lastIndex].lat},${roadPostData.path[lastIndex].lng}`
    );
    url.searchParams.append("waypoints", wayPoints);
    setGoogleMapURL(url.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [{}]);

  return (
    <>
      <Polyline path={roadPostData.path} options={{ strokeColor: "blue" }} />
      <Marker
        position={roadPostData.path[0]}
        icon={routeStartMarker}
        onClick={handleClickRoadMarker}
      />
      {infoWindow && zoomRate >= 11 ? (
        <InfoWindow
          options={infoWindowOptions}
          position={infoWindow}
          onCloseClick={() => setInfoWindow(undefined)}
        >
          <>
            From: {roadPostData.startRoadSpotName}
            <br />
            To: {roadPostData.endRoadSpotName}
            <br />
            <br />
            <Button variant="contained" size="small" color="primary">
              <a
                href={googleMapURL}
                rel="noopener noreferrer"
                target={"_blank"}
                style={{ color: "white", textDecoration: "none" }}
              >
                経路に設定
              </a>
            </Button>
          </>
        </InfoWindow>
      ) : null}
    </>
  );
};

export default RoadPostMarker;
