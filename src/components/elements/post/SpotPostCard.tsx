import React from "react";

import TagList from "~/components/elements/post/TagList";
import PostUserInfo from "~/components/elements/post/PostUserInfo";
import Reaction from "~/components/elements/other/Reaction";
import ImageArea from "~/components/elements/post/ImageArea";
import {
  Card,
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  Typography
} from "@material-ui/core";
import RoomIcon from "@material-ui/icons/Room";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import { SpotPost } from "~/interfaces";

type SpotPostCardProps = {
  spotPost: SpotPost;
};

const SpotPostCard: React.FC<SpotPostCardProps> = ({ spotPost }) => {
  const classes = useStyles();
  const history = useHistory();

  /**
   * Map画面に遷移する.
   *
   * @param e: React.MouseEvent<HTMLSpanElement, MouseEvent>
   */
  const seeSpotOnMapPage = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    e.stopPropagation();
    history.push({
      pathname: Path.map,
      state: {
        lat: spotPost.spotCoordinate.latitude,
        lng: spotPost.spotCoordinate.longitude,
        spotName: spotPost.spotName,
        postType: 1
      }
    });
  };

  /**
   * カード押下時に投稿詳細画面に遷移する.
   */
  const seeDetail = () => {
    history.push({ pathname: Path.postDetail + spotPost.postId });
  };

  return (
    <>
      <Card variant="outlined" onClick={seeDetail}>
        <div className={classes.postUserInfo}>
          <PostUserInfo postUser={spotPost.user} createAt={spotPost.createAt} />
        </div>
        <CardContent>
          <Typography
            variant="body2"
            color="textPrimary"
            component="p"
            align="left"
          >
            {spotPost.content}
          </Typography>
          <ImageArea postImagePaths={spotPost.postImagePaths} />
        </CardContent>

        {spotPost.tags.length > 0 && <TagList tags={spotPost.tags} />}

        <Grid
          container
          justify={"flex-start"}
          alignItems={"flex-start"}
          className={classes.control}
        >
          <Grid item xs={5}>
            <Reaction
              {...spotPost}
              toUser={{
                userId: spotPost.user.userId,
                accountId: spotPost.user.accountId
              }}
            />
          </Grid>

          <Grid item xs={7}>
            <Grid container justify={"flex-start"} alignItems={"flex-start"}>
              <Grid item xs={2}>
                <IconButton
                  onClick={seeSpotOnMapPage}
                  className={classes.positionIcon}
                >
                  <RoomIcon />
                </IconButton>
              </Grid>
              <Grid item xs={10}>
                <p className={classes.positionInfo} onClick={seeSpotOnMapPage}>
                  {spotPost.spotName}
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

export default SpotPostCard;