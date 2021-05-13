import React from "react";

import { Grid, makeStyles } from "@material-ui/core";
import { Room } from "@material-ui/icons";

import { SpotPostData } from "~/components/map";

type Props = {
  position:
    | {
        postType: 1;
        data: SpotPostData;
      }
    | {
        postType: 2;
        data: RoadPostDataAtPosition;
      };
  handleClickPosition: () => void;
};

type RoadPostDataAtPosition = {
  postType: 2;
  startRoadSpotName: string;
  endRoadSpotName: string;
};

const Position: React.FC<Props> = props => {
  const classes = useStyles();

  /**
   * 位置情報押下時、Map画面に遷移する.
   */
  const handleClickPosition = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    e.stopPropagation();
    props.handleClickPosition();
  };

  return (
    <div>
      <Grid container justify={"flex-start"} alignItems={"flex-start"}>
        <Grid item xs={1} onClick={handleClickPosition}>
          <Room className={classes.roomIcon} />
        </Grid>
        <Grid
          item
          xs={11}
          className={classes.position}
          onClick={handleClickPosition}
        >
          {props.position.postType === 1 ? (
            <Grid container justify={"flex-start"} alignItems={"center"}>
              <Grid item>&nbsp;{props.position.data.spotName}</Grid>
            </Grid>
          ) : (
            <Grid
              container
              justify={"center"}
              alignItems={"flex-start"}
              direction={"column"}
            >
              <Grid item>
                &nbsp;From: {props.position.data.startRoadSpotName}
              </Grid>
              <Grid item>&nbsp;To: {props.position.data.endRoadSpotName}</Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  roomIcon: {
    color: "grey"
  },
  position: {
    color: "grey",
    textAlign: "left",
    fontSize: "14px"
  }
}));

export default Position;
