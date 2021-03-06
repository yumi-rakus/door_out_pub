import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import {
  fetchLoginUser,
  selectLoginUser,
  selectProfile,
  setProfileAccountId,
  setProfileBio,
  setProfileEmail,
  setProfileName,
  setProfileUserImage,
  updateProfile,
  UpdateProfileForm,
  checkExistingAccountId,
  checkExistingEmail,
  selectExistsAccountId,
  selectExistsEmail
} from "~/store/slice/App/auth.slice";

import Header from "~/components/elements/other/Header";
import {
  Avatar,
  Button,
  Grid,
  InputAdornment,
  makeStyles,
  TextField,
  Typography,
  CircularProgress
} from "@material-ui/core";
import { AddAPhoto } from "@material-ui/icons";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

import HeaderStyle from "~/assets/css/Header.module.css";
import { HEADER_HEIGHT } from "~/assets/ExportCSS";

import { useSnackbar } from "notistack";
import { useErrorHandle } from "~/utils/useErrorHandle";
import {
  ACCOUNT_ID_LOWER_LIMIT,
  ACCOUNT_ID_UPPER_LIMIT,
  BIO_UPPER_LIMIT,
  EMAIL_UPPER_LIMIT,
  USER_NAME_UPPER_LIMIT
} from "~/utils/globalVariables";

const EditProfile: React.FC = () => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const loginUser = useSelector(selectLoginUser);
  const profile = useSelector(selectProfile);
  const existsAccountId = useSelector(selectExistsAccountId);
  const existsEmail = useSelector(selectExistsEmail);

  // component/state
  const [photoUrl, setPhotoUrl] = useState("");
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
  const [bio, setBio] = useState<{
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
  const [canComplete, setCanComplete] = useState(true);

  // ??????
  const FAILED_UPDATE_PROFILE_MESSAGE =
    "???????????????????????????????????????????????????????????????????????????????????????????????????????????????";

  useEffect(() => {
    if (!loginUser) {
      dispatch(fetchLoginUser()).catch(e => {
        catchUnauthorizedError(e.message);
      });
    }
  }, [catchUnauthorizedError, dispatch, loginUser]);

  useEffect(() => {
    if (profile.accountId !== null) {
      setAccountId({
        value: profile.accountId,
        errorMessage: accountIdValidation(profile.accountId)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.accountId]);

  useEffect(() => {
    if (profile.name !== null) {
      setUserName({
        value: profile.name,
        errorMessage: userNameValidation(profile.name)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.name]);

  useEffect(() => {
    if (profile.bio !== null) {
      setBio({
        value: profile.bio,
        errorMessage: bioValidation(profile.bio)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.bio]);

  useEffect(() => {
    if (profile.email !== null) {
      setEmail({
        value: profile.email,
        errorMessage: emailValidation(profile.email)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.email]);

  useEffect(() => {
    if (profile.userImage !== null) {
      setPhotoUrl(profile.userImage);
    }
  }, [profile.userImage]);

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
    if (
      accountId.errorMessage !== null &&
      userName.errorMessage !== null &&
      bio.errorMessage !== null &&
      email.errorMessage !== null
    ) {
      const isErrorAccountId = accountId.errorMessage.length !== 0;
      const isErrorUserName = userName.errorMessage.length !== 0;
      const isErrorBio = bio.errorMessage.length !== 0;
      const isErrorEmail = email.errorMessage.length !== 0;

      if (
        !isErrorAccountId &&
        !isErrorUserName &&
        !isErrorBio &&
        !isErrorEmail
      ) {
        setCanComplete(true);
      } else {
        setCanComplete(false);
      }
    }
  }, [
    accountId.errorMessage,
    bio.errorMessage,
    email.errorMessage,
    userName.errorMessage
  ]);

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
    if (loginUser?.accountId !== value) {
      dispatch(checkExistingAccountId(value));
    }

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

  const bioValidation = (value: string) => {
    // ?????????????????????
    if (value.length > BIO_UPPER_LIMIT) {
      return `${BIO_UPPER_LIMIT}????????????????????????????????????`;
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
    if (loginUser?.email !== value) {
      dispatch(checkExistingEmail(value));
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

  const handleChangeBio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBio({
      value: value,
      errorMessage: bioValidation(value)
    });
  };

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setEmail({
      value: value,
      errorMessage: emailValidation(value)
    });
  };

  // ------------------------------------------------------------------

  /**
   * ??????????????????????????????upload??????.
   *
   * @param event: React.ChangeEvent<HTMLInputElement>
   */
  const handleUploadClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const result: string = reader.result as string;
        setPhotoUrl(result);
      };
    }
  };

  /**
   * ?????????????????????????????????????????????????????????????????????????????????.
   */
  const handleClickCancel = async () => {
    await dispatch(fetchLoginUser()).catch(e => {
      catchUnauthorizedError(e.message);
    });
    history.push({ pathname: Path.userPage + loginUser?.userId });
  };

  /**
   * ?????????????????????????????????.
   * ?????????: ?????????????????????????????????.
   * ?????????: Snackbar??????????????????.
   */
  const handleClickComplete = () => {
    setCanComplete(false);

    // ????????????????????????upload???????????????????????????????????????????????????userImage???????????????.
    let updateProfileForm: UpdateProfileForm;
    if (photoUrl.match(/data:image\/.*;base64,.*/)) {
      updateProfileForm = {
        accountId: accountId.value,
        name: userName.value,
        bio: bio.value.trim(),
        email: email.value,
        userImage: photoUrl
      };
    } else {
      updateProfileForm = {
        accountId: accountId.value,
        name: userName.value,
        bio: bio.value.trim(),
        email: email.value
      };
    }

    dispatch(updateProfile(updateProfileForm))
      .then(() => {
        history.push({ pathname: Path.userPage + loginUser?.userId });
      })
      .catch(e => {
        catchUnauthorizedError(e.message);
        setPhotoUrl(
          loginUser && loginUser.userImagePath && loginUser.userImagePath.length
            ? loginUser!.userImagePath
            : ""
        );
        setAccountId({
          value: loginUser!.accountId,
          errorMessage: accountIdValidation(loginUser!.accountId)
        });
        setUserName({
          value: loginUser!.name,
          errorMessage: userNameValidation(loginUser!.name)
        });
        setBio({
          value: loginUser!.bio!,
          errorMessage: bioValidation(loginUser!.bio!)
        });
        setEmail({
          value: loginUser!.email!,
          errorMessage: emailValidation(loginUser!.email!)
        });

        setCanComplete(true);

        enqueueSnackbar(FAILED_UPDATE_PROFILE_MESSAGE, { variant: "error" });
      });
  };

  /**
   * ??????????????????????????????????????????????????????store???????????????.
   * (???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????)
   */
  const saveEditProfile = () => {
    dispatch(setProfileAccountId(accountId.value));
    dispatch(setProfileName(userName.value));
    dispatch(setProfileBio(bio.value.trim()));
    dispatch(setProfileEmail(email.value));
    dispatch(setProfileUserImage(photoUrl));
  };

  /**
   * ??????????????????????????????????????????.
   */
  const handleClickToChangePass = () => {
    saveEditProfile();
    history.push({ pathname: Path.changePassword });
  };

  /**
   * ?????????????????????????????????????????????.
   */
  const handleClickToEditExcludedCoordinates = () => {
    saveEditProfile();
    history.push({ pathname: Path.editExcludedCoordinates });
  };

  // ---------------------- Header JSX Element ----------------------
  // ????????????????????????
  const cancelBtn = (
    <Typography
      className={HeaderStyle.cancel}
      onClick={async () => {
        await handleClickCancel();
      }}
    >
      ???????????????
    </Typography>
  );

  // ???????????????
  const completeBtn = (
    <Button
      variant={"outlined"}
      color={"primary"}
      size={"small"}
      className={HeaderStyle.lastBtn}
      onClick={handleClickComplete}
      disabled={!canComplete}
    >
      ??????
    </Button>
  );

  return (
    <div>
      <Header first={cancelBtn} middle={null} last={completeBtn} />

      {loginUser ? (
        <div className={classes.editProfile}>
          <Grid
            container
            justify={"center"}
            alignItems={"center"}
            className={classes.editProfileForm}
          >
            <Grid item className={classes.changeIcon}>
              <input
                type={"file"}
                id={"contained-button-file"}
                accept={".jpg, .gif, .png"}
                className={classes.inputFile}
                onChange={handleUploadClick}
              />
              <label htmlFor={"contained-button-file"}>
                <Avatar
                  src={photoUrl}
                  variant={"circular"}
                  className={classes.avatar}
                />
                <AddAPhoto className={classes.addAPhotoIcon} />
              </label>
            </Grid>
          </Grid>
          <Grid
            container
            justify={"center"}
            alignItems={"center"}
            direction={"column"}
            style={{ marginTop: "5vh" }}
          >
            <Grid item className={classes.gridItem}>
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
                    : accountId.value.length + "/" + ACCOUNT_ID_UPPER_LIMIT
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">@</InputAdornment>
                  )
                }}
                className={classes.textField}
              />
            </Grid>
            <Grid item className={classes.gridItem}>
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
                    : userName.value.length + "/" + USER_NAME_UPPER_LIMIT
                }
                className={classes.textField}
              />
            </Grid>
            <Grid item className={classes.gridItem}>
              <TextField
                label="????????????"
                size={"small"}
                multiline
                rows={4}
                value={bio.value}
                onChange={handleChangeBio}
                error={bio.errorMessage !== null && bio.errorMessage.length > 0}
                helperText={
                  bio.errorMessage !== null && bio.errorMessage.length > 0
                    ? bio.errorMessage
                    : bio.value.trim().length + "/" + BIO_UPPER_LIMIT
                }
                className={classes.textField}
              />
            </Grid>
            <Grid item className={classes.gridItem}>
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
              />
            </Grid>
            <Grid item className={classes.gridItem}>
              <Grid
                container
                justify={"flex-start"}
                alignItems={"flex-start"}
                direction={"column"}
              >
                <Grid item>
                  <Button
                    color={"secondary"}
                    variant={"outlined"}
                    onClick={handleClickToEditExcludedCoordinates}
                    className={classes.button}
                  >
                    ?????????????????????????????????
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    color={"secondary"}
                    variant={"outlined"}
                    onClick={handleClickToChangePass}
                    className={classes.button}
                  >
                    ??????????????????????????????
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10)
  },
  inputFile: {
    display: "none"
  },
  changeIcon: {
    position: "relative"
  },
  addAPhotoIcon: {
    position: "absolute",
    top: "70%",
    left: "70%",
    color: "gray"
  },
  textField: {
    marginTop: "1vh",
    marginBottom: "1vh",
    padding: 0,
    backgroundColor: "white",
    width: "100%"
  },
  gridItem: {
    width: "80%"
  },
  editProfileForm: {
    paddingTop: "2vh"
  },
  editProfile: {
    marginTop: HEADER_HEIGHT
  },
  button: {
    margin: "1vh 0"
  }
}));

export default EditProfile;