import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import {
  fetchNotifications,
  selectNotice
} from "~/store/slice/Domain/notice.slice";

import Notice from "~/components/noticeList/Notice";
import Header from "~/components/elements/other/Header";
import { makeStyles, CircularProgress } from "@material-ui/core";

import InfiniteScroll from "react-infinite-scroller";
import { FETCH_NOTICES_LIMIT } from "~/utils/globalVariables";
import { useErrorHandle } from "~/utils/useErrorHandle";

import { HEADER_HEIGHT } from "~/assets/ExportCSS";
import { Notification } from "~/interfaces";

const NoticeList: React.FC = () => {
  const classes = noticeStyle();
  const dispatch: AppDispatch = useDispatch();

  // store/state
  const notices = useSelector(selectNotice);

  // component/state
  const [offset, setOffset] = useState(0);
  const [
    notifications,
    setNotifications
  ] = useState<Array<Notification> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [catchUnauthorizedError] = useErrorHandle();

  /**
   * 下までロードすると、setOffsetが発火して、offsetの値が変更
   * offsetが変わるとfetchNotificationsが発火して、サーバにリクエスト送信して、storeのnoticeが変更される
   * storeのnoticeが変更されると検知して、stateの既存noticeにstoreのnoticeが足されてstateのnoticeが変更される。
   */
  useEffect(() => {
    localStorage.setItem("newNoticesCount", "0");
    dispatch(
      fetchNotifications({ limit: FETCH_NOTICES_LIMIT, offset: offset })
    ).catch(e => {
      catchUnauthorizedError(e.message);
    });
    if (notices) {
      if (notices.length <= 15 && offset === 0) {
        setHasMore(false);
      }
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (notices) {
      if (notices.length === 0) {
        setHasMore(false);
      }

      if (offset === 0 || notifications === null) {
        setNotifications([...notices]);
      } else {
        setNotifications([...notifications, ...notices]);
      }
    }
    // eslint-disable-next-line
  }, [notices, offset]);

  const handleMore = () => {
    setOffset(offset + FETCH_NOTICES_LIMIT);
    dispatch(
      fetchNotifications({ limit: FETCH_NOTICES_LIMIT, offset: offset })
    ).catch(e => {
      catchUnauthorizedError(e.message);
    });
  };

  return (
    <div>
      <Header first={1} middle={null} last={null} />
      <div className={classes.main}>
        {notices !== null && notifications !== null ? (
          <InfiniteScroll
            loadMore={() => {
              handleMore();
            }}
            hasMore={hasMore}
            initialLoad={false}
            loader={<CircularProgress key={0} />}
          >
            <Notice
              notices={notifications.filter(
                (element, index, self) =>
                  self.findIndex(e => e.noticeId === element.noticeId) === index
              )}
            />
          </InfiniteScroll>
        ) : (
          <CircularProgress className={classes.main} />
        )}
      </div>
    </div>
  );
};

const noticeStyle = makeStyles(() => ({
  main: {
    marginTop: HEADER_HEIGHT
  }
}));

export default NoticeList;