import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { Path } from "~/router/routes";

const GuardedRoute = (props: RouteProps) => {
  const token = localStorage.getItem("Authorization");

  // tokenがない場合にログイン画面に飛ばす
  if (!token) {
    // ただし、以下のページについてはtokenの必要が無いため、ログイン画面に飛ばさない
    if (props.path !== Path.login && props.path !== Path.createUser) {
      return <Redirect to={Path.login} />;
    }
  }

  return <Route {...props} />;
};

export default GuardedRoute;