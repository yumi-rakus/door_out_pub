import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import { fetchLoginUser, selectLoginUser } from "~/store/slice/App/auth.slice";

import {
  Avatar,
  Grid,
  IconButton,
  makeStyles,
  Typography
} from "@material-ui/core";
import { ArrowBackIos } from "@material-ui/icons";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import { useErrorHandle } from "~/utils/useErrorHandle";
import { HEADER_HEIGHT } from "~/assets/ExportCSS";
import { selectPrevPathname } from "~/store/slice/App/ui.slice";

/**
 * firstに1が渡された場合、ログインユーザーアイコンが表示される.
 * firstに2が渡された場合、ひとつ前のページに戻るBackボタンが表示される.
 * middleに1が渡された場合、ロゴが表示される.
 */
type Props = {
  first: JSX.Element | 1 | 2 | null;
  middle: JSX.Element | 1 | null;
  last: JSX.Element | null;
};

const Header: React.FC<Props> = props => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const loginUser = useSelector(selectLoginUser);
  const prevPathname = useSelector(selectPrevPathname);

  useEffect(() => {
    if (localStorage.getItem("Authorization") && !loginUser) {
      dispatch(fetchLoginUser()).catch(e => {
        catchUnauthorizedError(e.message);
      });
    }
  }, [catchUnauthorizedError, dispatch, loginUser]);

  // ---------------------- methods ----------------------

  /**
   * ひとつ前のページへ戻る.
   */
  const handleBackBtn = () => {
    if (
      prevPathname &&
      prevPathname !== Path.editProfile &&
      prevPathname !== Path.editExcludedCoordinates &&
      prevPathname !== Path.addExcludedCoordinate &&
      prevPathname !== Path.changePassword
    ) {
      history.goBack();
    } else {
      history.push({ pathname: Path.timeline });
    }
  };

  /**
   * firstElementの決定を行う.
   */
  const displayFirstElement = () => {
    if (props.first === 1) {
      return loginUserAvatar;
    } else if (props.first === 2) {
      return back;
    } else {
      return props.first;
    }
  };

  // ---------------------- JSX Element ----------------------

  /**
   * ログインユーザーのアイコンを表示するJSX.
   * 押下するとユーザーページへ遷移する.
   */
  const loginUserAvatar = loginUser && (
    <Avatar
      variant={"circular"}
      src={loginUser.userImagePath}
      onClick={() => {
        history.push({ pathname: Path.userPage + loginUser?.userId });
      }}
    />
  );

  /**
   * ひとつ前のページに戻る.
   */
  const back = (
    <IconButton size={"small"} onClick={handleBackBtn}>
      <ArrowBackIos fontSize={"small"} />
    </IconButton>
  );

  /**
   * ロゴを表示するJSX.
   */
  const logo = <Typography className={classes.logo}>DoorOut</Typography>;

  return (
    <Grid
      container
      justify={"center"}
      alignItems={"center"}
      className={classes.header}
    >
      <Grid item xs={2}>
        {displayFirstElement()}
      </Grid>
      <Grid item xs={8}>
        {props.middle === 1 ? logo : props.middle}
      </Grid>
      <Grid item xs={2}>
        {props.last}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  logo: {
    fontWeight: "bold",
    fontFamily: "Trebuchet MS",
    fontSize: "22px"
  },
  header: {
    height: HEADER_HEIGHT,
    minHeight: HEADER_HEIGHT,
    padding: "0 3vw",
    margin: 0,
    backgroundColor: "rgb(211,211,211)",
    position: "fixed",
    top: 0,
    zIndex: 5
    // TODO: 境目が分かりやすいように一時的に背景色をつけています。後で消します。
  }
}));

export default Header;