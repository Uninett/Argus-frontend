import React from "react";

import DarkLogoSvg from "../../Media/img/logo/logo_dark.svg";
import WhiteLogoSvg from "../../Media/img/logo/logo_white.svg";

type LogoPropsType = {
  dark?: boolean;
  className?: string;
};

const Logo: React.FC<LogoPropsType> = ({ dark, className }: LogoPropsType) => {
  const src = dark ? DarkLogoSvg : WhiteLogoSvg;
  return <img className={className} src={src} alt="Argus logo" />;
};

Logo.defaultProps = {
  dark: false,
};

export default Logo;
