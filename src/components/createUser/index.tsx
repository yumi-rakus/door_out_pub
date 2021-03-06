import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import {
  checkExistingAccountId,
  checkExistingEmail,
  createUser,
  CreateUserForm,
  selectExistsAccountId,
  selectExistsEmail
} from "~/store/slice/App/auth.slice";

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
import { HEADER_HEIGHT, THEME_COLOR1 } from "~/assets/ExportCSS";

import {
  ACCOUNT_ID_LOWER_LIMIT,
  ACCOUNT_ID_UPPER_LIMIT,
  EMAIL_UPPER_LIMIT,
  PASSWORD_LOWER_LIMIT,
  PASSWORD_UPPER_LIMIT,
  USER_NAME_UPPER_LIMIT
} from "~/utils/globalVariables";

const CreateUser: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  // store/state
  const existsAccountId = useSelector(selectExistsAccountId);
  const existsEmail = useSelector(selectExistsEmail);

  // component/state
  const [accountId, setAccountId] = useState<{
    value: string;
    errorMessage: string | null;
  }>({
    value: "",
    errorMessage: null
  });
  const [userName, setUserName] = useState<{
    value: string;
    errorMessage: string | null;
  }>({
    value: "",
    errorMessage: null
  });
  const [email, setEmail] = useState<{
    value: string;
    errorMessage: string | null;
  }>({
    value: "",
    errorMessage: null
  });
  const [password, setPassword] = useState<{
    value: string;
    errorMessage: string | null;
  }>({
    value: "",
    errorMessage: null
  });
  const [confirmPassword, setConfirmPassword] = useState<{
    value: string;
    errorMessage: string | null;
  }>({
    value: "",
    errorMessage: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  // ??????
  const SUCCESS_CREATE_USER_MESSAGE = "??????????????????????????????????????????";
  const FAILED_CREATE_USER_MESSAGE =
    "???????????????????????????????????????????????????????????????????????????????????????????????????????????????";

  useEffect(() => {
    if (
      accountId.errorMessage !== null &&
      userName.errorMessage !== null &&
      email.errorMessage !== null &&
      password.errorMessage !== null &&
      confirmPassword.errorMessage !== null
    ) {
      const isErrorAccountId = accountId.errorMessage.length !== 0;
      const isErrorUserName = userName.errorMessage.length !== 0;
      const isErrorEmail = email.errorMessage.length !== 0;
      const isErrorPassword = password.errorMessage.length !== 0;
      const isErrorConfirmPassword = confirmPassword.errorMessage.length !== 0;

      if (
        !isErrorAccountId &&
        !isErrorUserName &&
        !isErrorEmail &&
        !isErrorPassword &&
        !isErrorConfirmPassword
      ) {
        setCanSubmit(true);
      } else {
        setCanSubmit(false);
      }
    }
  }, [
    accountId.errorMessage,
    confirmPassword.errorMessage,
    email.errorMessage,
    password.errorMessage,
    userName.errorMessage
  ]);

  useEffect(() => {
    if (existsAccountId) {
      setAccountId({
        value: accountId.value,
        errorMessage: "??????????????????????????????ID??????"
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existsAccountId]);

  useEffect(() => {
    if (existsEmail) {
      setEmail({
        value: email.value,
        errorMessage: "??????????????????????????????????????????"
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existsEmail]);

  useEffect(() => {
    if (confirmPassword.errorMessage !== null) {
      setConfirmPassword({
        value: confirmPassword.value,
        errorMessage: confirmPasswordValidation(confirmPassword.value)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password.value]);

  // ---------------------- Validation Func ----------------------

  const accountIdValidation = (value: string) => {
    // ?????????????????????
    if (!value || value === "") return "???????????????ID???????????????????????????";

    // ????????????????????????
    const regex = /^\w+$/;
    if (!regex.test(value)) {
      return "???????????????????????????????????????????????????(_)???????????????????????????????????????";
    }

    // ?????????????????????
    if (
      value.length < ACCOUNT_ID_LOWER_LIMIT ||
      value.length > ACCOUNT_ID_UPPER_LIMIT
    ) {
      return `${ACCOUNT_ID_LOWER_LIMIT}?????????${ACCOUNT_ID_UPPER_LIMIT}????????????????????????????????????`;
    }

    // ????????????????????????ID????????????????????????
    dispatch(checkExistingAccountId(value));

    return "";
  };

  const userNameValidation = (value: string) => {
    // ?????????????????????
    if (!value || value === "") return "?????????????????????????????????";
    // ?????????????????????
    if (value.length > USER_NAME_UPPER_LIMIT) {
      return `${USER_NAME_UPPER_LIMIT}????????????????????????????????????`;
    }
    return "";
  };

  const emailValidation = (value: string) => {
    // ?????????????????????
    if (!value || value === "") return "????????????????????????????????????????????????";

    // ??????????????????
    const regex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!regex.test(value)) {
      return "??????????????????????????????????????????";
    }

    // ?????????????????????
    if (value.length > EMAIL_UPPER_LIMIT) {
      return `${EMAIL_UPPER_LIMIT}????????????????????????????????????`;
    }

    // ?????????????????????????????????????????????
    dispatch(checkExistingEmail(value));

    return "";
  };

  const passwordValidation = (value: string) => {
    // ?????????????????????
    if (!value || value === "") return "??????????????????????????????????????????";

    // ????????????????????????
    const regex = /^[A-Za-z0-9]+$/;
    if (!regex.test(value)) {
      return "??????????????????????????????????????????????????????????????????";
    }

    // ?????????????????????
    if (
      value.length < PASSWORD_LOWER_LIMIT ||
      value.length > PASSWORD_UPPER_LIMIT
    ) {
      return `${PASSWORD_LOWER_LIMIT}?????????${PASSWORD_UPPER_LIMIT}????????????????????????????????????`;
    }

    return "";
  };

  const confirmPasswordValidation = (value: string) => {
    // ?????????????????????
    if (!value || value === "") return "???????????????????????????????????????????????????";

    // ????????????????????????
    const regex = /^[A-Za-z0-9]+$/;
    if (!regex.test(value)) {
      return "??????????????????????????????????????????????????????????????????";
    }

    // ?????????????????????
    if (
      value.length < PASSWORD_LOWER_LIMIT ||
      value.length > PASSWORD_UPPER_LIMIT
    ) {
      return `${PASSWORD_LOWER_LIMIT}?????????${PASSWORD_UPPER_LIMIT}????????????????????????????????????`;
    }

    // password????????????????????????????????????
    if (password.value !== value) {
      return "??????????????????????????????????????????????????????";
    }

    return "";
  };

  // ---------------------- handleChange Func ----------------------

  const handleChangeAccountId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setAccountId({
      value: value,
      errorMessage: accountIdValidation(value)
    });
  };

  const handleChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setUserName({
      value: value,
      errorMessage: userNameValidation(value)
    });
  };

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setEmail({
      value: value,
      errorMessage: emailValidation(value)
    });
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setPassword({
      value: value,
      errorMessage: passwordValidation(value)
    });
  };

  const handleChangeConfirmPassword = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.trim();
    setConfirmPassword({
      value: value,
      errorMessage: confirmPasswordValidation(value)
    });
  };

  // ------------------------------------------------------------------

  /**
   * ???????????????????????????.
   */
  const handleClickUserCreateBtn = () => {
    setCanSubmit(false);

    const form: CreateUserForm = {
      accountId: accountId.value,
      name: userName.value,
      email: email.value,
      password: password.value
    };

    dispatch(createUser(form))
      .then(() => {
        enqueueSnackbar(SUCCESS_CREATE_USER_MESSAGE, { variant: "success" });
        history.push({ pathname: Path.login });
      })
      .catch(() => {
        setAccountId({ value: "", errorMessage: null });
        setUserName({ value: "", errorMessage: null });
        setEmail({ value: "", errorMessage: null });
        setPassword({ value: "", errorMessage: null });
        setConfirmPassword({ value: "", errorMessage: null });

        enqueueSnackbar(FAILED_CREATE_USER_MESSAGE, { variant: "error" });
      });
  };

  /**
   * key?????????????????????????????????
   * ????????????Key???Enter????????????handleClickUserCreateBtn???????????????
   * @param e:????????????Key??????
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSubmit) {
      handleClickUserCreateBtn();
    }
  };

  return (
    <div>
      <Header first={null} middle={1} last={null} />
      <Grid
        container
        justify={"center"}
        alignItems={"center"}
        className={classes.control}
      >
        <Grid item xs={10}>
          <Paper
            elevation={0}
            variant={"outlined"}
            className={classes.createUserForm}
          >
            <Grid
              container
              justify={"center"}
              alignItems={"center"}
              direction={"column"}
            >
              <Grid item style={{ margin: 20 }}>
                <Typography variant={"h6"} className={classes.title}>
                  ????????????????????????
                </Typography>
              </Grid>
              <Grid item style={{ width: "80%" }}>
                <TextField
                  label="???????????????ID"
                  type={"search"}
                  size={"small"}
                  value={accountId.value}
                  onChange={handleChangeAccountId}
                  error={
                    accountId.errorMessage !== null &&
                    accountId.errorMessage.length > 0
                  }
                  helperText={
                    accountId.errorMessage !== null &&
                    accountId.errorMessage.length > 0
                      ? accountId.errorMessage
                      : "???"
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">@</InputAdornment>
                    )
                  }}
                  className={classes.textField}
                  onKeyPress={handleKeyPress}
                />
              </Grid>
              <Grid item style={{ width: "80%" }}>
                <TextField
                  label="???????????????"
                  type={"search"}
                  size={"small"}
                  value={userName.value}
                  onChange={handleChangeUserName}
                  error={
                    userName.errorMessage !== null &&
                    userName.errorMessage.length > 0
                  }
                  helperText={
                    userName.errorMessage !== null &&
                    userName.errorMessage.length > 0
                      ? userName.errorMessage
                      : "???"
                  }
                  className={classes.textField}
                  onKeyPress={handleKeyPress}
                />
              </Grid>
              <Grid item style={{ width: "80%" }}>
                <TextField
                  label="?????????????????????"
                  type={"search"}
                  size={"small"}
                  value={email.value}
                  onChange={handleChangeEmail}
                  error={
                    email.errorMessage !== null && email.errorMessage.length > 0
                  }
                  helperText={
                    email.errorMessage !== null && email.errorMessage.length > 0
                      ? email.errorMessage
                      : "???"
                  }
                  className={classes.textField}
                  onKeyPress={handleKeyPress}
                />
              </Grid>
              <Grid item style={{ width: "80%" }}>
                <TextField
                  label="???????????????"
                  type={showPassword ? "text" : "password"}
                  size={"small"}
                  value={password.value}
                  onChange={handleChangePassword}
                  error={
                    password.errorMessage !== null &&
                    password.errorMessage.length > 0
                  }
                  helperText={
                    password.errorMessage !== null &&
                    password.errorMessage.length > 0
                      ? password.errorMessage
                      : "???"
                  }
                  className={classes.textField}
                  onKeyPress={handleKeyPress}
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
              <Grid item style={{ width: "80%" }}>
                <TextField
                  label="??????????????????????????????"
                  type={showConfirmPassword ? "text" : "password"}
                  size={"small"}
                  value={confirmPassword.value}
                  onChange={handleChangeConfirmPassword}
                  error={
                    confirmPassword.errorMessage !== null &&
                    confirmPassword.errorMessage.length > 0
                  }
                  helperText={
                    confirmPassword.errorMessage !== null &&
                    confirmPassword.errorMessage.length > 0
                      ? confirmPassword.errorMessage
                      : "???"
                  }
                  className={classes.textField}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            setShowConfirmPassword(!showConfirmPassword);
                          }}
                        >
                          {showConfirmPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
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
                  onClick={handleClickUserCreateBtn}
                  className={classes.createUserBtn}
                  disabled={!canSubmit}
                >
                  ??????
                </Button>
              </Grid>
              <Grid item style={{ margin: 20 }} />
            </Grid>
          </Paper>
          <Grid container justify={"center"} alignItems={"center"}>
            <Grid item>
              <Typography
                onClick={() => {
                  history.push(Path.login);
                }}
                className={classes.toLogin}
              >
                ??????????????????????????????
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  control: {
    marginTop: HEADER_HEIGHT
  },
  createUserForm: {
    marginTop: "3vh"
  },
  title: {
    fontWeight: "bold"
  },
  textField: {
    marginTop: "1vh",
    marginBottom: "1vh",
    padding: 0,
    backgroundColor: "white",
    width: "100%"
  },
  createUserBtn: {
    marginTop: "2vh"
  },
  toLogin: {
    margin: "1vh",
    color: THEME_COLOR1
  }
}));

export default CreateUser;