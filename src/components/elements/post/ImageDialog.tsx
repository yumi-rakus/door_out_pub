import React from "react";
import { makeStyles, createStyles, Modal } from "@material-ui/core";

type Prop = {
  open: boolean;
  imagePath: string;
  onClose: () => void;
};

const ImageDialog: React.FC<Prop> = ({ open, imagePath, onClose }) => {
  const classes = useStyles();
  /**
   * ダイアログを閉じる.
   *
   * @param e: React.MouseEvent<HTMLDivElement>
   */
  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <>
      <Modal
        onClick={handleClose}
        open={open}
        className={classes.modal}
        disableScrollLock={false}
      >
        <img
          style={{ maxWidth: "80%", height: "auto", outline: "none" }}
          src={imagePath}
          alt=""
        />
      </Modal>
    </>
  );
};
const useStyles = makeStyles(() =>
  createStyles({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white"
    }
  })
);

export default ImageDialog;
