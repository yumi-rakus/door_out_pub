import React, { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import { Button, Grid, IconButton, makeStyles } from "@material-ui/core";
import { Close, InsertPhoto } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import Compressor from "compressorjs";

type Props = {
  base64Images: Array<string>;
  setNewBase64Images: (base64Images: Array<string>) => void;
};

const ImageAttached: React.FC<Props> = props => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  // component/state
  const [isImageCountWithinMaxRange, setIsImageCountWithinMaxRange] = useState(
    true
  );

  useEffect(() => {
    if (props.base64Images.length >= 5) {
      // 画像枚数が上限を超えている場合
      setIsImageCountWithinMaxRange(false);
      props.setNewBase64Images(props.base64Images.slice(0, 4));
    } else {
      // 画像枚数が上限を超えていない場合
      if (!isImageCountWithinMaxRange) {
        setIsImageCountWithinMaxRange(true);
      }
    }
    // eslint-disable-next-line
  }, [isImageCountWithinMaxRange, props.base64Images]);

  useEffect(() => {
    if (!isImageCountWithinMaxRange) {
      enqueueSnackbar("画像の上限枚数は4枚です", { variant: "error" });
    }
  }, [enqueueSnackbar, isImageCountWithinMaxRange, props]);

  /**
   * アップロードされた画像をformにsetする.
   *
   * @param event: ChangeEvent<HTMLInputElement>
   */
  const handleChangeImages = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    let count = 0;
    let newBase64Images: Array<string> = [...props.base64Images];

    const files = Array.from(event.target.files);

    files.forEach(file => {
      if (file === null) {
        return;
      }
      if (file.type === "image/gif") {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result: string = reader.result as string;
          newBase64Images.push(result);
          count += 1;

          if (files.length === count) {
            props.setNewBase64Images(newBase64Images);
          }
        };
      } else {
        new Compressor(file, {
          quality: 0.8,
          width: 700,
          height: 700,
          mimeType: "image/jpeg",
          success(blob: Blob): void {
            if (blob.size >= 200000) {
              alert("画像サイズが大きすぎます。");
              return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => {
              const result: string = reader.result as string;
              newBase64Images.push(result);
              count += 1;

              if (files.length === count) {
                props.setNewBase64Images(newBase64Images);
              }
            };
          },
          error(e) {
            alert("画像の処理に失敗しました。");
          }
        });
      }
    });
  };

  /**
   * アップロードした画像のうち、選択したものを消去する.
   *
   * @param event: MouseEvent<HTMLElement>
   */
  const handleClose = (event: MouseEvent<HTMLElement>) => {
    const id = event.currentTarget.id;
    let newBase64Images: Array<string> = [];

    if (id === "closeIcon0") {
      newBase64Images = props.base64Images.filter(
        image => props.base64Images.indexOf(image) !== 0
      );
    } else if (id === "closeIcon1") {
      newBase64Images = props.base64Images.filter(
        image => props.base64Images.indexOf(image) !== 1
      );
    } else if (id === "closeIcon2") {
      newBase64Images = props.base64Images.filter(
        image => props.base64Images.indexOf(image) !== 2
      );
    } else if (id === "closeIcon3") {
      newBase64Images = props.base64Images.filter(
        image => props.base64Images.indexOf(image) !== 3
      );
    }
    props.setNewBase64Images(newBase64Images);
  };

  return (
    <>
      <Grid container justify={"flex-start"} alignItems={"center"}>
        <Grid item>
          <strong className={classes.icon}>+</strong>
          <IconButton size={"small"}>
            <InsertPhoto color={"primary"} fontSize={"large"} />
            <input
              type={"file"}
              className={classes.inputFileBtn}
              accept={"image/png, image/jpg, image/jpeg, image/gif"}
              onChange={handleChangeImages}
              multiple
              id={"fileInput"}
            />
          </IconButton>
        </Grid>
        <Grid item className={classes.addPhotoHelperText}>
          <span>&nbsp;4枚まで写真を投稿できます</span>
        </Grid>
      </Grid>

      <Grid container justify={"center"} alignItems={"center"}>
        {/*１枚目*/}
        {props.base64Images.length >= 1 ? (
          <Grid item xs={6}>
            <Grid container justify={"center"}>
              <Grid item xs={1}>
                <Button id={"closeIcon0"} onClick={handleClose}>
                  <Close fontSize={"default"} color={"error"} />
                </Button>
              </Grid>
              <Grid item xs={11}>
                <img
                  id="preview0"
                  src={props.base64Images[0]}
                  className={classes.imgPreview}
                  alt={""}
                />
              </Grid>
            </Grid>
          </Grid>
        ) : null}

        {/*２枚目*/}
        {props.base64Images.length >= 2 ? (
          <Grid item xs={6}>
            <Grid container justify={"center"}>
              <Grid item xs={1}>
                <Button id={"closeIcon1"} onClick={handleClose}>
                  <Close fontSize={"default"} color={"error"} />
                </Button>
              </Grid>
              <Grid item xs={11}>
                <img
                  id="preview1"
                  src={props.base64Images[1]}
                  className={classes.imgPreview}
                  alt={""}
                />
              </Grid>
            </Grid>
          </Grid>
        ) : null}

        {/*３枚目*/}
        {props.base64Images.length >= 3 ? (
          <Grid item xs={6}>
            <Grid container justify={"center"}>
              <Grid item xs={1}>
                <Button id={"closeIcon2"} onClick={handleClose}>
                  <Close fontSize={"default"} color={"error"} />
                </Button>
              </Grid>
              <Grid item xs={11}>
                <img
                  id="preview2"
                  src={props.base64Images[2]}
                  className={classes.imgPreview}
                  alt={""}
                />
              </Grid>
            </Grid>
          </Grid>
        ) : null}

        {/*４枚目*/}
        {props.base64Images.length >= 4 ? (
          <Grid item xs={6}>
            <Grid container justify={"center"}>
              <Grid item xs={1}>
                <Button id={"closeIcon3"} onClick={handleClose}>
                  <Close fontSize={"default"} color={"error"} />
                </Button>
              </Grid>
              <Grid item xs={11}>
                <img
                  id="preview3"
                  src={props.base64Images[3]}
                  className={classes.imgPreview}
                  alt={""}
                />
              </Grid>
            </Grid>
          </Grid>
        ) : null}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(() => ({
  icon: {
    color: "grey",
    marginTop: "5px"
  },
  inputFileBtn: {
    opacity: 0,
    appearance: "none",
    position: "absolute"
  },
  addPhotoHelperText: {
    textAlign: "left",
    color: "grey",
    fontSize: "11px"
  },
  imgPreview: {
    width: "80%",
    padding: 20,
    objectFit: "contain"
  }
}));

export default ImageAttached;
