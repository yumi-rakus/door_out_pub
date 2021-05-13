import React, { useState } from "react";

import GpsFixedIcon from "@material-ui/icons/GpsFixed";
import { IconButton, CircularProgress } from "@material-ui/core";

import { useSnackbar } from "notistack";

import {
  defaultMapCenter,
  LOCATION_INFO_NOT_ACTIVE_MSG
} from "~/utils/globalVariables";

type Props = {
  setCenter: (lat: number, lng: number) => void;
};

const CurrentPositionButton: React.FC<Props> = ({ setCenter }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);

  /**
   * 現在位置を取得する.
   */
  const handleIconClick = () => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        const data = position.coords;
        const lat = data.latitude;
        const lng = data.longitude;
        setIsLoading(false);
        setCenter(lat, lng);
      },
      () => {
        setCenter(defaultMapCenter.lat, defaultMapCenter.lng);
        enqueueSnackbar(LOCATION_INFO_NOT_ACTIVE_MSG, {
          preventDuplicate: true
        });
        setIsLoading(false);
      }
    );
  };

  return (
    <>
      <IconButton
        onClick={handleIconClick}
        style={{ backgroundColor: "white" }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : (
          <GpsFixedIcon fontSize="large" style={{ color: "black" }} />
        )}
      </IconButton>
    </>
  );
};

export default CurrentPositionButton;