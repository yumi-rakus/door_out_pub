import React, { useEffect, useState } from "react";

import {
  GoogleMap,
  Marker,
  Polyline,
  useLoadScript
} from "@react-google-maps/api";
import {
  CircularProgress,
  Grid,
  IconButton,
  makeStyles
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Refresh } from "@material-ui/icons";

import { API_KEY, LIBRARIES } from "~/api.config";
import SpotMarker from "~/assets/SpotMarker.png";
import RoadMarker from "~/assets/RouteMarker.png";
import { SpotPostData, RoadPostData } from "~/components/map";

type Props = {
  position:
    | {
        postType: 1;
        data: SpotPostData;
      }
    | {
        postType: 2;
        data: RoadPostData;
      };
  handleClickMap: () => void;
};

const MiniMap: React.FC<Props> = props => {
  const classes = useStyles();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES
  });

  // component/state
  const [map, setMap] = useState<google.maps.Map>();
  const [center, setCenter] = useState<{ lat: number; lng: number }>();
  const [zoom, setZoom] = useState(14);
  const [mapContent, setMapContent] = useState<JSX.Element>();
  const [refreshSpot, setRefreshSpot] = useState<{
    lat: number;
    lng: number;
  }>();

  // map option & style
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: false
  };

  const mapContainerStyle = {
    width: "100%",
    height: "100%"
  };

  useEffect(() => {
    if (props.position.postType === 1) {
      const spotLatLng = {
        lat: props.position.data.lat,
        lng: props.position.data.lng
      };
      const jsx = <Marker icon={SpotMarker} position={spotLatLng} />;
      setCenter(spotLatLng);
      setRefreshSpot(spotLatLng);
      setMapContent(jsx);
    } else if (props.position.postType === 2) {
      if (props.position.data.path.length > 0) {
        const startLatLng = {
          lat: props.position.data.path[0]?.lat,
          lng: props.position.data.path[0]?.lng
        };
        setCenter(startLatLng);
        setRefreshSpot(startLatLng);
        const jsx = (
          <div>
            <Polyline
              path={props.position.data.path}
              options={{ strokeColor: "blue" }}
            />
            <Marker icon={RoadMarker} position={startLatLng} />
          </div>
        );
        setMapContent(jsx);
      } else {
        setCenter(undefined);
      }
    }
  }, [props.position]);

  /**
   * GoogleMapをloadした際に走る処理.
   *
   * @param map: google.maps.Map
   */
  const handleLoadMap = (map: google.maps.Map) => {
    setMap(map);
  };

  /**
   * ミニマップをDragした際に走る処理.
   */
  const handleDragEnd = () => {
    if (map) {
      const newCenter = {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng()
      };
      setCenter(newCenter);
    }
  };

  /**
   * ミニマップのズーム率を変更した際に走る処理.
   */
  const handleZoomChanged = () => {
    if (map) {
      setZoom(map.getZoom());
      const newCenter = {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng()
      };
      setCenter(newCenter);
    }
  };

  /**
   * ミニマップ押下時、Map画面に遷移する.
   */
  const handleClickMap = () => {
    props.handleClickMap();
  };

  /**
   * ミニマップ(のcenter位置、ズーム率)を初期状態に戻す.
   */
  const handleClickRefresh = () => {
    setCenter(refreshSpot);
    setZoom(14);
  };

  if (loadError)
    return <Alert severity={"error"}>マップの取得に失敗しました。</Alert>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <div className={classes.miniMap}>
      <GoogleMap
        options={mapOptions}
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onClick={center ? handleClickMap : undefined}
        onLoad={handleLoadMap}
        onDragEnd={center ? handleDragEnd : undefined}
        onZoomChanged={center ? handleZoomChanged : undefined}
      >
        {mapContent}
      </GoogleMap>
      <Grid container justify={"flex-start"} alignItems={"center"}>
        <Grid item>
          <IconButton
            onClick={handleClickRefresh}
            size={"small"}
            className={classes.refresh}
            style={{ backgroundColor: "white" }}
          >
            <Refresh />
          </IconButton>
        </Grid>
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  refresh: {
    position: "absolute",
    bottom: "5%",
    right: "2%"
  },
  miniMap: {
    width: "100%",
    height: "100%",
    position: "relative"
  }
}));

export default MiniMap;
