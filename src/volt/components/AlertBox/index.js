import React from "react";
import styled from "styled-components";
import { Flex } from "rimble-ui";
const AlertBox = styled(Flex).attrs({
  p: 3
})`
  justify-content: center;
  text-align: center;
  color: white;
  background-color: ${({ type }) => {
    switch (type) {
      case "success":
        return "#0ceba1";
      case "fail":
        return "#FF2C14";
      default:
        return "#582C83";
    }
  }};
`;

export default ({ alert, changeAlert }) => {
  const { type, message } = alert;
  console.log("render alert box");
  console.log({ alert });
  return (
    <div
      style={{ zIndex: 20 }}
      className="footer text-center"
      onClick={() => changeAlert(null)}
    >
      <AlertBox type={type}>{message}</AlertBox>
    </div>
  );
};
