import React, { useState } from "react";

import ImageDialog from "~/components/elements/post/ImageDialog";
import { CardMedia, Grid } from "@material-ui/core";

type Props = {
  postImagePaths: Array<{
    postImagePath: string;
    postImagePathId: string;
    status: string;
  }>;
};

const ImageArea: React.FC<Props> = props => {
  // component/state
  const [clickedImagePath, setClickedImagePath] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const imageMarginLeft = (index: number) => {
    if (index === 0) {
      return "8%";
    } else if (index === 1) {
      return "1%";
    } else if (index === 2 && props.postImagePaths.length === 3) {
      return "28%";
    } else if (index === 2) {
      return "8%";
    } else if (index === 3) {
      return "1%";
    }
  };

  const imageMarginTop = (index: number) => {
    if (index === 2 || index === 3) {
      return "1%";
    } else {
      return "0%";
    }
  };

  /**
   * SpotPostオブジェクト内のpostImagePathsにある写真をCardMediaコンポーネントとして返す関数
   * @returns CardMediaコンポーネントを含めたGridコンポーネント
   */
  const putPhotos = () => {
    return (
      <Grid container>
        {props.postImagePaths.map((imagePath, index) => (
          <Grid
            key={index}
            style={{
              marginLeft: imageMarginLeft(index),
              marginTop: imageMarginTop(index)
            }}
            item
            xs={props.postImagePaths.length === 1 ? 10 : 5}
          >
            <CardMedia
              image={imagePath.postImagePath}
              style={{ height: 0, paddingTop: "56.25%" }} // 56.25% = 16:9
              onClick={e => handleClickImage(e, imagePath.postImagePath)}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  /**
   * ダイアログを開き、写真を表示する.
   *
   * @param e: React.MouseEvent<HTMLDivElement, MouseEvent>
   * @param imagePath: 写真のpath
   */
  const handleClickImage = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    imagePath: string
  ) => {
    e.stopPropagation();
    setClickedImagePath(imagePath);
    setDialogOpen(true);
  };

  /**
   * ダイアログを閉じる.
   */
  const handleCloseDialog = () => {
    setClickedImagePath("");
    setDialogOpen(false);
  };

  return (
    <>
      <div
        className="imageArea"
        style={{ marginTop: props.postImagePaths.length > 0 ? "8%" : "0%" }}
      >
        {putPhotos()}
      </div>
      <ImageDialog
        imagePath={clickedImagePath}
        onClose={handleCloseDialog}
        open={dialogOpen}
      />
    </>
  );
};

export default ImageArea;
