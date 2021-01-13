import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

export function useIsMobile(): boolean {
  const theme = useTheme();
  const matchesMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return matchesMobile;
}

export function useBackground(backgroundCss: string) {
  document.body.style.background = backgroundCss;
}
