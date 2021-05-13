import React, { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { AppDispatch } from "~/store";
import { updatePassword } from "~/store/slice/App/auth.slice";

import Header from "~/components/elements/other/Header";
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  makeStyles,
  TextField,
  Typography
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import { useSnackbar } from "notistack";
import { useErrorHandle } from "~/utils/useErrorHandle";

import HeaderStyle from "~/assets/css/Header.module.css";
import { HEADER_HEIGHT } from "~/assets/ExportCSS";

const ChangePassword: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // component/state
  const [oldPass, setOldPass] = useState<{
    value: string;
    errorMessage: string | null;
  }>({
    value: "",
    errorMessage: null
  });
  const [newPass, setNewPass] = useState<{
    value: string;
    errorMessage: string | null;
  }>({
    value: "",
    errorMessage: null
  });
  const [confirmNewPass, setConfirmNewPass] = useState<{
    value: string;
    errorMessage: string | null;
  }>({
    value: "",
    errorMessage: null
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);
  const [canComplete, setCanComplete] = useState(false);

  // 定数
  const PASSWORD_LOWER_LIMIT = 6;
  const PASSWORD_UPPER_LIMIT = 16;
  const FAILED_CHANGE_PASS_MESSAGE =
    "現在のパスワードが異なります。再度お試しください。";

  useEffect(() => {
    if (
      oldPass.errorMessage !== null &&
      newPass.errorMessage !== null &&
      confirmNewPass.errorMessage !== null
    ) {
      const isErrorOldPass = oldPass.errorMessage.length !== 0;
      const isErrorNewPass = newPass.errorMessage.length !== 0;
      const isErrorConfirmNewPass = confirmNewPass.errorMessage.length !== 0;

      if (!isErrorOldPass && !isErrorNewPass && !isErrorConfirmNewPass) {
        setCanComplete(true);
      } else {
        setCanComplete(false);
      }
    }
  }, [confirmNewPass.errorMessage, newPass.errorMessage, oldPass.errorMessage]);

  useEffect(() => {
    if (confirmNewPass.errorMessage !== null) {
      setConfirmNewPass({
        value: confirmNewPass.value,
        errorMessage: confirmNewPassValidation(confirmNewPass.value)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPass.value]);

  // ---------------------- Validation Func ----------------------

  const oldPassValidation = (value: string) => {
    // 空文字チェック
    if (!value || value === "") return "現在のパスワードを入力してください";

    // 使用文字チェック
    const regex = /^[A-Za-z0-9]+$/;
    if (!regex.test(value)) {
      return "半角英字、半角英字以外は使用しないでください";
    }

    // 文字数チェック
    if (
      value.length < PASSWORD_LOWER_LIMIT ||
      value.length > PASSWORD_UPPER_LIMIT
    ) {
      return `${PASSWORD_LOWER_LIMIT}字以上${PASSWORD_UPPER_LIMIT}字以内で入力してください`;
    }
    return "";
  };

  const newPassValidation = (value: string) => {
    // 空文字チェック
    if (!value || value === "") return "パスワードを入力してください";

    // 使用文字チェック
    const regex = /^[A-Za-z0-9]+$/;
    if (!regex.test(value)) {
      return "半角英字、半角英字以外は使用しないでください";
    }

    // 文字数チェック
    if (
      value.length < PASSWORD_LOWER_LIMIT ||
      value.length > PASSWORD_UPPER_LIMIT
    ) {
      return `${PASSWORD_LOWER_LIMIT}字以上${PASSWORD_UPPER_LIMIT}字以内で入力してください`;
    }

    return "";
  };

  const confirmNewPassValidation = (value: string) => {
    // 空文字チェック
    if (!value || value === "") return "確認用パスワードを入力してください";

    // 使用文字チェック
    const regex = /^[A-Za-z0-9]+$/;
    if (!regex.test(value)) {
      return "半角英字、半角英字以外は使用しないでください";
    }

    // 文字数チェック
    if (
      value.length < PASSWORD_LOWER_LIMIT ||
      value.length > PASSWORD_UPPER_LIMIT
    ) {
      return `${PASSWORD_LOWER_LIMIT}字以上${PASSWORD_UPPER_LIMIT}字以内で入力してください`;
    }

    // passwordと一致しているかチェック
    if (newPass.value !== value) {
      return "入力したパスワードと一致していません";
    }

    return "";
  };

  // ---------------------- handleChange Func ----------------------

  const handleChangeOldPass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setOldPass({
      value: value,
      errorMessage: oldPassValidation(value)
    });
  };

  const handleChangeNewPass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setNewPass({
      value: value,
      errorMessage: newPassValidation(value)
    });
  };

  const handleChangeConfirmNewPassword = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.trim();
    setConfirmNewPass({
      value: value,
      errorMessage: confirmNewPassValidation(value)
    });
  };

  // ------------------------------------------------------------------

  /**
   * パスワード変更をキャンセルし、プロフィール編集画面に戻る.
   */
  const handleClickCancel = () => {
    history.push({ pathname: Path.editProfile });
  };

  /**
   * パスワード変更を行う.
   * 成功時: プロフィール編集画面に戻る.
   * 失敗時: Snackbarが表示される.
   */
  const handleClickComplete = () => {
    setCanComplete(false);

    dispatch(
      updatePassword({ oldPassword: oldPass.value, newPassword: newPass.value })
    )
      .then(() => {
        history.push({ pathname: Path.editProfile });
      })
      .catch(e => {
        catchUnauthorizedError(e.message);

        setOldPass({ value: "", errorMessage: null });
        setNewPass({ value: "", errorMessage: null });
        setConfirmNewPass({ value: "", errorMessage: null });
        setCanComplete(false);

        enqueueSnackbar(FAILED_CHANGE_PASS_MESSAGE, { variant: "error" });
      });
  };

  /////// Headerに表示する要素
  const cancelBtn = (
    <Typography className={HeaderStyle.cancel} onClick={handleClickCancel}>
      キャンセル
    </Typography>
  );

  const changeBtn = (
    <Button
      variant={"outlined"}
      color={"primary"}
      size={"small"}
      className={HeaderStyle.lastBtn}
      onClick={handleClickComplete}
      disabled={!canComplete}
    >
      完了
    </Button>
  );
  ///////

  return (
    <div>
      <Header first={cancelBtn} middle={1} last={changeBtn} />
      <Grid
        container
        justify={"center"}
        alignItems={"center"}
        direction={"column"}
        className={classes.changePassword}
      >
        <Grid item>
          <TextField
            label="現在のパスワード"
            type={showOldPass ? "text" : "password"}
            size={"medium"}
            value={oldPass.value}
            onChange={handleChangeOldPass}
            error={
              oldPass.errorMessage !== null && oldPass.errorMessage.length > 0
            }
            helperText={
              oldPass.errorMessage !== null && oldPass.errorMessage.length > 0
                ? oldPass.errorMessage
                : "　"
            }
            className={classes.textField}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setShowOldPass(!showOldPass);
                    }}
                  >
                    {showOldPass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item>
          <TextField
            label="新しいパスワード"
            type={showNewPass ? "text" : "password"}
            size={"medium"}
            value={newPass.value}
            onChange={handleChangeNewPass}
            error={
              newPass.errorMessage !== null && newPass.errorMessage.length > 0
            }
            helperText={
              newPass.errorMessage !== null && newPass.errorMessage.length > 0
                ? newPass.errorMessage
                : "　"
            }
            className={classes.textField}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setShowNewPass(!showNewPass);
                    }}
                  >
                    {showNewPass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item>
          <TextField
            label="パスワード確認"
            type={showConfirmNewPass ? "text" : "password"}
            size={"medium"}
            value={confirmNewPass.value}
            onChange={handleChangeConfirmNewPassword}
            error={
              confirmNewPass.errorMessage !== null &&
              confirmNewPass.errorMessage.length > 0
            }
            helperText={
              confirmNewPass.errorMessage !== null &&
              confirmNewPass.errorMessage.length > 0
                ? confirmNewPass.errorMessage
                : "　"
            }
            className={classes.textField}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setShowConfirmNewPass(!showConfirmNewPass);
                    }}
                  >
                    {showConfirmNewPass ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  textField: {
    marginTop: "1vh",
    marginBottom: "1vh",
    padding: 0,
    backgroundColor: "white",
    width: "100%"
  },
  changePassword: {
    marginTop: HEADER_HEIGHT,
    paddingTop: "3vh"
  }
}));

export default ChangePassword;