import React, { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import {
  fetchNotifications,
  selectNotice
} from "~/store/slice/Domain/notice.slice";
import { setPrevPathname } from "~/store/slice/App/ui.slice";

import MenuBar from "~/components/elements/other/MenuBar";
import { IconButton, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { Close } from "@material-ui/icons";

import { useHistory, useLocation } from "react-router-dom";
import routes, { Path } from "~/router/routes";

import { FETCH_NEW_NOTICES_LIMIT } from "~/utils/globalVariables";
import { SnackbarKey, SnackbarProvider } from "notistack";

import "~/assets/css/App.css";

function App() {
  const history = useHistory();
  const location = useLocation();
  const dispatch: AppDispatch = useDispatch();
  const notistackRef = useRef<SnackbarProvider>(null);

  // store/state
  const notices = useSelector(selectNotice);

  // component/state
  const [isDisplayMenuBar, setIsDisplayMenuBar] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    settingIsDisplayMenuBar();
    return history.listen(nextLocation => {
      if (
        location.pathname !== Path.editProfile &&
        location.pathname !== Path.editExcludedCoordinates &&
        location.pathname !== Path.addExcludedCoordinate &&
        location.pathname !== Path.changePassword
      ) {
        dispatch(setPrevPathname(nextLocation.pathname));
      }

      settingIsDisplayMenuBar();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.pathname]);

  useEffect(() => {
    if (
      location.pathname !== Path.noticeList &&
      location.pathname !== Path.login &&
      location.pathname !== Path.createUser
    ) {
      dispatch(
        fetchNotifications({ limit: FETCH_NEW_NOTICES_LIMIT, offset: 0 })
      ).catch(e => {
        if ((e.message = "401")) {
          setOpen(true);
          history.push({ pathname: Path.login });
        }
      });

      const latestNotices = localStorage.getItem("latestNotices");
      const previousNotices = localStorage.getItem("previousNotices");
      if (notices) {
        localStorage.setItem("latestNotices", JSON.stringify(notices));
        if (latestNotices) {
          if (
            notices.length > 0 &&
            previousNotices &&
            previousNotices.length === 0
          ) {
            localStorage.setItem("previousNotices", latestNotices);
          }
        } else if (!latestNotices && !previousNotices) {
          localStorage.setItem("latestNotices", JSON.stringify(notices));
          localStorage.setItem("previousNotices", JSON.stringify(notices));
          localStorage.setItem("newNoticesCount", "0");
        }
      }
    }
    // eslint-disable-next-line
  }, [location.pathname]);

  useEffect(() => {
    const latestNotices = localStorage.getItem("latestNotices");
    const previousNotices = localStorage.getItem("previousNotices");
    if (latestNotices && previousNotices) {
      const latestArray: Array<{
        content: string;
        createdAt: string;
        name: string;
        noticeType: number;
        noticeId: string;
        postId: string;
        userId: string;
        userImagePath: string;
      }> = JSON.parse(latestNotices);
      const previousArray: Array<{
        content: string;
        createdAt: string;
        name: string;
        noticeType: number;
        noticeId: string;
        postId: string;
        userId: string;
        userImagePath: string;
      }> = JSON.parse(previousNotices);
      const latestNoticeIdList: Array<String> = [];
      const previousNoticeIdList: Array<String> = [];
      //noticeIdだけを抽出して新たなリストを作成
      latestArray.forEach(latestNotice => {
        latestNoticeIdList.push(latestNotice.noticeId);
      });
      //noticeIdだけを抽出して新たなリストを作成
      previousArray.forEach(previousNotice => {
        previousNoticeIdList.push(previousNotice.noticeId);
      });
      //latestNoticeIdListだけに存在するnoticeIdを抽出
      const diff = latestNoticeIdList.filter(
        latestNoticeId => previousNoticeIdList.indexOf(latestNoticeId) === -1
      );
      if (diff.length >= 1) {
        localStorage.setItem("newNoticesCount", diff.length.toString());
        localStorage.setItem("previousNotices", latestNotices);
      }
    }
    // eslint-disable-next-line
  }, [localStorage.getItem("latestNotices")]);

  const handleClose = () => {
    setOpen(false);
  };

  /**
   * SnackBarを消す.
   *
   * @param key: SnackbarKey
   */
  const onClickDismiss = (key: SnackbarKey) => {
    if (notistackRef.current) notistackRef.current.closeSnackbar(key);
  };

  /**
   * MenuBarの表示・非表示を制御する.
   */
  const settingIsDisplayMenuBar = () => {
    if (
      history.location.pathname === Path.login ||
      history.location.pathname === Path.createUser ||
      history.location.pathname === Path.editProfile ||
      history.location.pathname === Path.changePassword ||
      history.location.pathname === Path.editExcludedCoordinates ||
      history.location.pathname === Path.addExcludedCoordinate
    ) {
      setIsDisplayMenuBar(false);
    } else {
      setIsDisplayMenuBar(true);
    }
  };

  return (
    <SnackbarProvider
      maxSnack={2}
      ref={notistackRef}
      action={key => (
        <IconButton
          onClick={() => {
            onClickDismiss(key);
          }}
        >
          <Close style={{ color: "white" }} />
        </IconButton>
      )}
    >
      <div className="App">
        {routes}

        {isDisplayMenuBar ? (
          <div className={"MenuBar"}>
            <MenuBar />
          </div>
        ) : null}
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
        >
          <Alert variant={"filled"} severity={"error"} onClose={handleClose}>
            再度ログインしてください
          </Alert>
        </Snackbar>
      </div>
    </SnackbarProvider>
  );
}

export default App;