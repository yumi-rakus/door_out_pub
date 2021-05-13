import { useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";
import { useSnackbar } from "notistack";

export const useErrorHandle = () => {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const catchUnauthorizedError = useCallback(
    (statusCode: string) => {
      if (statusCode === "401") {
        localStorage.removeItem("Authorization");
        enqueueSnackbar("再度ログインしてください。", { variant: "error" });
        history.push({ pathname: Path.login });
      }
    },
    [enqueueSnackbar, history]
  );

  return [catchUnauthorizedError] as const;
};