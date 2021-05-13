import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";

import { GoogleMap, Polyline, useLoadScript } from "@react-google-maps/api";
import RoomIcon from "@material-ui/icons/Room";
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  Typography
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import PostUserInfo from "~/components/elements/post/PostUserInfo";
import Reaction from "~/components/elements/other/Reaction";
import TagList from "~/components/elements/post/TagList";
import ImageArea from "~/components/elements/post/ImageArea";
import decode from "~/utils/decode";
import { Path } from "~/router/routes";
import { RoadPost, Coordinate } from "~/interfaces";
import { API_KEY, LIBRARIES } from "~/api.config";
import { GET_NO_ROAD_PATH_MSG } from "~/utils/globalVariables";

type Props = {
  roadPost: RoadPost;
};

const RoadPostCard: React.FC<Props> = ({ roadPost }) => {
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [isMount, setIsMount] = useState(true);

  useEffect(() => {
    decode(roadPost.encodedRoadCoordinate)
      .then(route => {
        if (isMount) {
          setPath(route);
          setInitialCenter({ lat: route[0].lat, lng: route[0].lng });
        }
      })
      .catch(() =>
        enqueueSnackbar(GET_NO_ROAD_PATH_MSG, {
          variant: "error",
          preventDuplicate: true
        })
      );
    return () => setIsMount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadPost]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES
  });

  // component/state
  const [path, setPath] = useState<Array<Coordinate>>([]);
  const [initialCenter, setInitialCenter] = useState<Coordinate>();

  // map options & style
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: false
  };

  const mapContainerStyle = {
    width: "100%",
    height: "30vh"
  };

  /**
   * カード押下時に投稿詳細画面に遷移にする.
   */
  const seeDetail = () => {
    history.push({ pathname: Path.postDetail + roadPost.postId });
  };

  /**
   * Map画面に遷移する.
   *
   * @param e: React.MouseEvent<HTMLSpanElement, MouseEvent>
   */
  const seeRoadOnMapPage = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    e.stopPropagation();
    if (path.length > 0) {
      history.push({
        pathname: Path.map,
        state: {
          // encodedPolyline: roadPost.encodedRoadCoordinate,
          startRoadSpotName: roadPost.roadStartSpotName,
          endRoadSpotName: roadPost.roadEndSpotName,
          path: path,
          postType: 2
        }
      });
    }
  };

  return (
    <>
      <Card variant="outlined" onClick={seeDetail}>
        <div className={classes.postUserInfo}>
          <PostUserInfo postUser={roadPost.user} createAt={roadPost.createAt} />
        </div>
        <CardContent>
          <Typography
            variant="body2"
            color="textPrimary"
            component="p"
            align="left"
          >
            {roadPost.content}
          </Typography>
          <br />

          <Grid container>
            <Grid item xs={1} />
            {isLoaded && (
              <Grid item xs={10}>
                <span onClick={e => e.stopPropagation()}>
                  <GoogleMap
                    center={initialCenter}
                    zoom={15}
                    mapContainerStyle={mapContainerStyle}
                    options={mapOptions}
                  >
                    <Polyline options={{ strokeColor: "blue" }} path={path} />
                  </GoogleMap>
                </span>
              </Grid>
            )}
            {loadError && (
              <Alert severity={"error"}>マップの取得に失敗しました。</Alert>
            )}
          </Grid>
          <ImageArea postImagePaths={roadPost.postImagePaths} />
        </CardContent>

        {roadPost.tags.length > 0 && <TagList tags={roadPost.tags} />}

        <Grid
          container
          justify={"flex-start"}
          alignItems={"flex-start"}
          className={classes.control}
        >
          <Grid item xs={5}>
            <Reaction
              {...roadPost}
              toUser={{
                userId: roadPost.user.userId,
                accountId: roadPost.user.accountId
              }}
            />
          </Grid>

          <Grid item xs={7}>
            <Grid container justify={"flex-start"} alignItems={"flex-start"}>
              <Grid item xs={2}>
                <IconButton
                  onClick={seeRoadOnMapPage}
                  className={classes.positionIcon}
                >
                  <RoomIcon />
                </IconButton>
              </Grid>
              <Grid item xs={10}>
                <p className={classes.positionInfo} onClick={seeRoadOnMapPage}>
                  From: {roadPost.roadStartSpotName}
                  <br />
                  To: {roadPost.roadEndSpotName}
                </p>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </>
  );
};

const useStyles = makeStyles(() => ({
  positionInfo: {
    fontSize: 12,
    textAlign: "left",
    color: "grey"
  },
  positionIcon: {
    fontSize: 25,
    paddingRight: "0",
    paddingLeft: "0"
  },
  postUserInfo: {
    width: "95%"
  },
  control: {
    padding: "0 5%"
  }
}));

export default RoadPostCard;