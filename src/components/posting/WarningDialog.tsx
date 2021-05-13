import React from "react";

import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogContentText,
  DialogTitle
} from "@material-ui/core";
import WarningIcon from "@material-ui/icons/Warning";

import { AppDispatch } from "~/store";
import { SpotForm, RoadForm } from "~/store/slice/Domain/post.slice";
import { useErrorHandle } from "~/utils/useErrorHandle";
import { Path } from "~/router/routes";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  post: SpotForm | RoadForm;
  postDispatch: Function;
  postId?: string;
};

const WarningDialog: React.FC<Props> = props => {
  const dispatch: AppDispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  // eslint-disable-next-line
  const [catchUnauthorizedError] = useErrorHandle();
  const history = useHistory();
  /**
   * ダイアログを閉じる.
   */
  const handleClose = () => {
    props.handleClose();
  };

  /**
   * 強制敵に投稿する.
   */
  const handleClickPostBtn = () => {
    props.post.canPostForcibly = true;
    if (props.postId) {
      dispatch(
        props.postDispatch({ postId: props.postId, roadForm: props.post })
      )
        .then(() => {
          enqueueSnackbar("投稿が完了しました", { variant: "success" });
          history.push({ pathname: Path.map });
        })
        .catch((e: any) => {
          const statusCode = e.message;
          if (statusCode === "401") {
            catchUnauthorizedError(statusCode);
          }
          if (statusCode === "400" || statusCode === "422") {
            enqueueSnackbar("投稿に失敗しました", { variant: "error" });
          }
        });
    } else {
      dispatch(props.postDispatch(props.post))
        .then(() => {
          enqueueSnackbar("投稿が完了しました", { variant: "success" });
          history.push({ pathname: Path.map });
        })
        .catch((e: any) => {
          const statusCode = e.message;
          if (statusCode === "401") {
            catchUnauthorizedError(statusCode);
          }
          if (statusCode === "400" || statusCode === "422") {
            enqueueSnackbar("投稿に失敗しました", { variant: "error" });
          }
        });
    }
    props.handleClose();
  };

  return (
    <>
      <Dialog open={props.isOpen} onClose={handleClose}>
        <DialogTitle>
          <WarningIcon color={"error"} />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            位置情報により、個人情報漏洩のおそれがあります。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>やめる</Button>
          <Button color={"primary"} onClick={handleClickPostBtn}>
            投稿する
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WarningDialog;
