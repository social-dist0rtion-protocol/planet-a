import React from "react";
import { FooterContainer, History, Timer } from "./styles";

const Footer = (props) => {
  const { history } = props;
  return (
    <FooterContainer>
      <History history={history} />
      <Timer {...props} />
    </FooterContainer>
  );
};

export default Footer;
