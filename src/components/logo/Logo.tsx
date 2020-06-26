import React from "react";

import DarkLogoSvg from "../../Media/img/logo/logo_dark.svg";
import WhiteLogoSvg from "../../Media/img/logo/logo_white.svg";

type LogoPropsType = {
  dark?: boolean;
};

const Logo: React.FC<LogoPropsType> = ({ dark }: LogoPropsType) => {
  const src = dark ? DarkLogoSvg : WhiteLogoSvg;
  return <img src={src} alt="Argus logo" />;
};

Logo.defaultProps = {
  dark: false,
};

export default Logo;
