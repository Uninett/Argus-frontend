import React from "react";

import DarkLogoSvg from "../../Media/img/logo/logo_dark.svg";
import WhiteLogoSvg from "../../Media/img/logo/logo_white.svg";

const Logo: React.FC<{ dark?: boolean; white?: boolean }> = ({ dark, ...props }) => {
  const src = dark ? DarkLogoSvg : WhiteLogoSvg;
  return <img src={src} alt="argus logo" />;
};

Logo.defaultProps = {
  dark: false,
};

export default Logo;
