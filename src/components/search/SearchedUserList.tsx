import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { selectUserSearchLoadMore } from "~/store/slice/Domain/user.slice";

import UserCard from "~/components/elements/user/UserCard";
import { Divider, ListItem, makeStyles } from "@material-ui/core";

import { Path } from "~/router/routes";
import { useHistory } from "react-router-dom";

import InfiniteScroller from "react-infinite-scroller";
import { User } from "~/interfaces";

type Prop = {
  userList: Array<User>;
  handleLoadMore: () => void;
};

const SearchedUserList: React.FC<Prop> = ({ userList, handleLoadMore }) => {
  const classes = useStyles();
  const history = useHistory();

  // store/state
  const hasMore = useSelector(selectUserSearchLoadMore);

  // component/state
  const [interval, setInterval] = useState(true);

  useEffect(() => {
    return () => setInterval(true);
  });

  /**
   * ユーザーページに遷移する.
   *
   * @param userId: ユーザーID
   */
  const toUserPage = (userId: string) => {
    history.push({ pathname: Path.userPage + userId });
  };

  // ユーザー一覧のJSXを作成
  const userCardList = userList.map((user, index) => {
    const listItem = (
      <ListItem button className={classes.listItem}>
        <UserCard user={user} handleClick={() => toUserPage(user.userId)} />
      </ListItem>
    );

    //  最後のListItem以外には<Divider/>を表示する
    if (index !== userList.length - 1) {
      return (
        <div key={user.userId}>
          {listItem}
          <Divider />
        </div>
      );
    } else {
      return <div key={user.userId}>{listItem}</div>;
    }
  });

  return (
    <>
      <InfiniteScroller
        loadMore={() => {
          setInterval(false);
          setTimeout(() => setInterval(true), 2000);
          handleLoadMore();
        }}
        hasMore={hasMore && interval}
        initialLoad={false}
      >
        {userCardList}
        {userList.length === 0 && (
          <div className={classes.emptyMessage}>ユーザーが見つかりません。</div>
        )}
      </InfiniteScroller>
    </>
  );
};

const useStyles = makeStyles(() => ({
  listItem: {
    padding: 3,
    width: "100%"
  },
  emptyMessage: {
    marginTop: "60%",
    color: "grey"
  }
}));

export default SearchedUserList;