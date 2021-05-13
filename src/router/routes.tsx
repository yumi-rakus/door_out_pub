import React from "react";

import { Redirect, Switch } from "react-router-dom";

import Login from "~/components/login";
import CreateUser from "~/components/createUser";
import UserPage from "~/components/userPage";
import EditProfile from "~/components/userPage/editProfile";
import EditExcludedCoordinates from "~/components/userPage/editProfile/editExcludedCoordinates";
import AddExcludedCoordinate from "~/components/userPage/editProfile/editExcludedCoordinates/addExcludedCoordinate";
import ChangePassword from "~/components/userPage/editProfile/changePassword";
import Timeline from "~/components/timeline";
import Map from "~/components/map";
import Search from "~/components/search";
import NoticeList from "~/components/noticeList";
import PostSpot from "~/components/posting/postSpot";
import RoadRecord from "~/components/posting/roadRecord";
import PostRoad from "~/components/posting/postRoad";
import PostDetail from "~/components/postDetail";
import GuardedRoute from "~/router/GuardedRoute";
import LoginGuardedRoute from "~/router/LoginGuardedRoute";

export const Path = {
  login: "/login",
  createUser: "/createUser",
  userPage: "/user/",
  editProfile: "/edit",
  editExcludedCoordinates: "/edit/excludedCoordinates",
  addExcludedCoordinate: "/edit/excludedCoordinates/add",
  changePassword: "/edit/change/pass",
  timeline: "/timeline",
  map: "/",
  search: "/search",
  noticeList: "/notice",
  postSpot: "/spot/post",
  roadRecord: "/road/record",
  postRoad: "/road/post",
  postDetail: "/postDetail/"
};

///// memo /////
// user詳細ページへの遷移の際は、
// history.push({pathname: Path.userPage + ユーザーID})
//
// user詳細ページへの遷移の際は、
// history.push({pathname: Path.postDetail + ポストID})
//
// でお願いします

const routes = (
  <Switch>
    <LoginGuardedRoute exact path={Path.login} component={Login} />
    <GuardedRoute exact path={Path.createUser} component={CreateUser} />
    <GuardedRoute exact path={Path.userPage + ":userId"} component={UserPage} />
    <GuardedRoute exact path={Path.editProfile} component={EditProfile} />
    <GuardedRoute
      exact
      path={Path.editExcludedCoordinates}
      component={EditExcludedCoordinates}
    />
    <GuardedRoute
      exact
      path={Path.addExcludedCoordinate}
      component={AddExcludedCoordinate}
    />
    <GuardedRoute exact path={Path.changePassword} component={ChangePassword} />
    <GuardedRoute exact path={Path.timeline} component={Timeline} />
    <GuardedRoute exact path={Path.map} component={Map} />
    <GuardedRoute exact path={Path.search} component={Search} />
    <GuardedRoute exact path={Path.noticeList} component={NoticeList} />
    <GuardedRoute exact path={Path.postSpot} component={PostSpot} />
    <GuardedRoute exact path={Path.roadRecord} component={RoadRecord} />
    <GuardedRoute exact path={Path.postRoad} component={PostRoad} />
    <GuardedRoute
      exact
      path={Path.postDetail + ":postId"}
      component={PostDetail}
    />
    <Redirect to={Path.timeline} />
  </Switch>
);

export default routes;
