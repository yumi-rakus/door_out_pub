import React, { useEffect, useState } from "react";

import { AppDispatch } from "~/store";
import { useDispatch } from "react-redux";
import { fetchLoginUser, login, LoginForm } from "~/store/slice/App/auth.slice";

import Header from "~/components/elements/other/Header";
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  makeStyles,
  Paper,
  TextField,
  Typography
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import { useSnackbar } from "notistack";
import { THEME_COLOR1 } from "~/assets/ExportCSS";

import { useErrorHandle } from "~/utils/useErrorHandle";
import {
  PASSWORD_LOWER_LIMIT,
  PASSWORD_UPPER_LIMIT
} from "~/utils/globalVariables";

const Login: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // component/state
  const [accountIdOrEmail, setAccountIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountIdOrEmailLength, setAccountIdOrEmailLength] = useState<
    number | null
  >(null);
  const [passwordLength, setPasswordLength] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidPass, setIsValidPass] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  // 定数
  const PASSWORD_ERROR_MESSAGE = `*${PASSWORD_LOWER_LIMIT}字以上${PASSWORD_UPPER_LIMIT}字以内で入力してください`;
  const FAILED_LOGIN_MESSAGE =
    "入力されたユーザー名やパスワードが正しくありません。確認後に再度お試しください。";

  useEffect(() => {
    // 空文字をtrimし、入力されていない項目がある場合はLOGINボタンを非活性化する
    if (
      accountIdOrEmail.replace("　", " ").trim().length === 0 ||
      password.replace("　", " ").trim().length === 0
    ) {
      setCanSubmit(false);
    } else {
      setCanSubmit(true);
    }

    // パスワードの文字数が指定外だった場合、エラーメッセージを表示かつLOGINボタンを非活性化する
    if (
      passwordLength !== null &&
      (password.replace("　", " ").trim().length < PASSWORD_LOWER_LIMIT ||
        password.replace("　", " ").trim().length > PASSWORD_UPPER_LIMIT)
    ) {
      setIsValidPass(true);
    } else {
      setIsValidPass(false);
    }
  }, [accountIdOrEmail, password, passwordLength]);

  // methods
  /**
   * ログインする.
   * 失敗時: パスワード入力フォームをリセットし、スナックバーを表示する.
   */
  const handleClickLoginBtn = () => {
    setCanSubmit(false);

    const loginForm: LoginForm = {
      accountIdOrEmail: accountIdOrEmail.replace("　", " ").trim(),
      password: password
    };
    dispatch(login(loginForm))
      .then(() => {
        dispatch(fetchLoginUser()).catch(e => {
          catchUnauthorizedError(e.message);
        });
        history.push({ pathname: Path.map });
      })
      .catch(() => {
        setPasswordLength(null);
        setPassword("");
        setIsValidPass(false);
        setCanSubmit(false);
        enqueueSnackbar(FAILED_LOGIN_MESSAGE, { variant: "error" });
      });
  };

  /**
   * keyが押される度に発火する
   * 押されたKeyがEnterの時のみhandleLoginClickを呼び出す
   * @param e:押されたKeyの値
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSubmit && !isValidPass) {
      handleClickLoginBtn();
    }
  };

  return (
    <div>
      <Header first={null} middle={1} last={null} />
      <Grid container justify={"center"} alignItems={"center"}>
        <Grid item xs={10}>
          <Paper
            elevation={0}
            variant={"outlined"}
            className={classes.loginForm}
          >
            <Grid
              container
              justify={"center"}
              alignItems={"center"}
              direction={"column"}
            >
              <Grid item style={{ margin: 20 }} />
              <Grid item style={{ width: "80%" }}>
                <TextField
                  label="メールアドレス or アカウントID"
                  size={"small"}
                  value={accountIdOrEmail}
                  onChange={e => {
                    setAccountIdOrEmail(e.target.value);
                    setAccountIdOrEmailLength(e.target.value.length);
                  }}
                  error={accountIdOrEmailLength === 0}
                  className={classes.textField}
                  onKeyPress={e => handleKeyPress(e)}
                />
              </Grid>
              <Grid item style={{ width: "80%" }}>
                <TextField
                  label="パスワード"
                  type={showPassword ? "text" : "password"}
                  size={"small"}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setPasswordLength(e.target.value.length);
                  }}
                  error={passwordLength === 0 || isValidPass}
                  helperText={isValidPass ? PASSWORD_ERROR_MESSAGE : " "}
                  className={classes.textField}
                  onKeyPress={e => handleKeyPress(e)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setShowPassword(!showPassword);
                          }}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item>
                <Button
                  color={"primary"}
                  variant={"contained"}
                  disableElevation
                  onClick={handleClickLoginBtn}
                  className={classes.loginBtn}
                  disabled={!canSubmit || isValidPass}
                >
                  LOGIN
                </Button>
              </Grid>
              <Grid item style={{ margin: 20 }} />
            </Grid>
          </Paper>
          <Grid container justify={"center"} alignItems={"center"}>
            <Grid item>
              <Typography
                onClick={() => {
                  history.push(Path.createUser);
                }}
                className={classes.toCreateUser}
              >
                新規ユーザー作成
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  loginForm: {
    marginTop: "25vh",
    padding: 0
  },
  textField: {
    marginTop: "1vh",
    marginBottom: "1vh",
    padding: 0,
    backgroundColor: "white",
    width: "100%"
  },
  loginBtn: {
    marginTop: "2vh"
  },
  toCreateUser: {
    margin: "1vh",
    color: THEME_COLOR1
  }
}));

export default Login;