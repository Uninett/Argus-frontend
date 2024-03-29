import React from "react";

import DarkLogo from "../../Media/img/logo/logo_dark.svg";
import WhiteLogo from "../../Media/img/logo/logo_white.svg";

type LogoPropsType = {
  dark?: boolean;
  className?: string;
};

const Logo: React.FC<LogoPropsType> = ({ dark, className }: LogoPropsType) => {
  const src = dark ? DarkLogo : WhiteLogo;
  return <img className={className} src={src} alt="Argus logo" />;
};

Logo.defaultProps = {
  dark: false,
};

export default Logo;
