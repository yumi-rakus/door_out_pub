import React from "react";
import { Redirect, Route, RouteProps } from "react-router-dom";
import { Path } from "~/router/routes";

const LoginGuardedRoute = (props: RouteProps) => {
  const token = localStorage.getItem("Authorization");

  // ログイン状態でログイン画面を表示しようとした場合に、map画面にリダイレクトさせる
  if (token && props.path === Path.login) {
    return <Redirect to={Path.map} />;
  }

  return <Route {...props} />;
};

export default LoginGuardedRoute;