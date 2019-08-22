import React from "react";
import styled from "styled-components";
import { Text } from "rimble-ui";

// Here are all the classes that can be used to style the balance.
// Some of them are not in use now, but are listed for clarity.

const StyledBalance = styled.div`
  text-align: center;
  padding: 20px 0;

  color: var(--primary);

  .otherAssets {
    color: var(--dark-text);
  }

  span {
    font-size: 2.5em;
    font-weight: 700;
  }

  .integer {
    font-size: 400%;
  }

  .group {
  }

  .decimal {
  }

  .fraction {
  }

  .literal {
  }

  .currency {
    font-size: 100%;
  }
`;

export default ({ mainAmount, otherAmounts, currencyDisplay }) => {
  if (isNaN(mainAmount) || typeof mainAmount === "undefined") {
    mainAmount = 0.0;
  }

  const otherAssetsTotal = Object.values(otherAmounts).reduce(
    (acc, curr) => acc + parseInt(curr, 10),
    0
  );

  return (
    <>
      <StyledBalance>
        <Text.span>{currencyDisplay(mainAmount)}</Text.span>
        {otherAssetsTotal > 0 && (
          <Text className="otherAssets" italic fontSize={1} textAlign="center">
            +{currencyDisplay(otherAssetsTotal)} in other assets
          </Text>
        )}
      </StyledBalance>
      <hr />
    </>
  );
};
