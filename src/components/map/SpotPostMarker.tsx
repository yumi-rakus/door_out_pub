import React, { useState, useEffect } from "react";

import Button from "@material-ui/core/Button";
import { Marker, InfoWindow } from "@react-google-maps/api";
import { useSnackbar } from "notistack";

import { SpotPostData } from "~/components/map";
import spotMarker from "~/assets/SpotMarker.png";
import {
  GOOGLE_MAP_URL,
  LOCATION_INFO_NOT_ACTIVE_MSG
} from "~/utils/globalVariables";

type Prop = {
  zoomRate: number;
  mapSize: google.maps.Size | undefined;
  spotPostData: SpotPostData;
  isLocationActive: boolean;
};

const SpotPostMarker: React.FC<Prop> = ({
  spotPostData,
  zoomRate,
  mapSize,
  isLocationActive
}) => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    zoomRate < 11 && setInfoWindow(undefined);
  }, [zoomRate]);

  const [infoWindow, setInfoWindow] = useState<SpotPostData>();
  const [googleMapURL, setGoogleMapURL] = useState("");

  const infoWindowOptions = {
    pixelOffset: mapSize,
    visible: false
  };

  /**
   *投稿地点のマーカーをクリックした際に呼び出される関数
   *InfoWindowを適切な位置に表示するためのstateにセット
   */
  const handleClickMarker = () => {
    setInfoWindow(undefined);
    setInfoWindow(spotPostData);
  };

  useEffect(() => {
    const url = new URL(GOOGLE_MAP_URL);
    url.searchParams.append("api", "1");
    navigator.geolocation.getCurrentPosition(currentPosition => {
      const currentLat = currentPosition.coords.latitude;
      const currentLng = currentPosition.coords.longitude;
      url.searchParams.append("origin", `${currentLat}, ${currentLng}`);
      url.searchParams.append(
        "destination",
        `${spotPostData.lat},${spotPostData.lng}`
      );
      setGoogleMapURL(url.href);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Marker
        icon={spotMarker}
        position={spotPostData}
        onClick={handleClickMarker}
      />
      {infoWindow && zoomRate >= 11 ? (
        <InfoWindow
          options={infoWindowOptions}
          position={spotPostData}
          onCloseClick={() => setInfoWindow(undefined)}
        >
          <>
            {spotPostData.spotName}
            <br />
            <Button color="secondary" variant="contained" size="small">
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
                  onClick={() => enqueueSnackbar(LOCATION_INFO_NOT_ACTIVE_MSG)}
                >
                  目的地に設定
                </span>
              )}
            </Button>
          </>
        </InfoWindow>
      ) : null}
    </>
  );
};

export default SpotPostMarker;
