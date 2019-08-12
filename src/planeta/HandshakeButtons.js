import React from "react";
import { Text, Heading } from "rimble-ui";
import { BorderButton } from "../components/Buttons";
import { choice } from "./utils";

const COLLABORATE_EMOJIS = ["🥰", "🌹", "🍻", "🥂"];
const DEFECT_EMOJIS = ["😈", "☠️", "🗡️", "💣"];

export default function HandshakeButtons({ handleStrategy }) {
  const collaborateEmoji = choice(COLLABORATE_EMOJIS);
  const defectEmoji = choice(DEFECT_EMOJIS);

  return (
    <>
      <Heading.h5>Play fair ☺️</Heading.h5>
      <Text fontSize={1}>
        Earn Göllars by being fair to the environment <strong>and</strong> to
        your handshake partner. Hopefully, they are fair to you as well 🤞
      </Text>
      <BorderButton
        mt={2}
        fullWidth
        onClick={() => handleStrategy("collaborate")}
      >
        {collaborateEmoji} I want to be fair! {collaborateEmoji}
      </BorderButton>
      <hr />
      <Heading.h5>Play greedy 🤑</Heading.h5>
      <Text fontSize={1}>
        Wanna make extra money? <strike>Deceive your handshake partner</strike>{" "}
        Play smart to earn <strong>more</strong> Göllars. But watch out, you
        might get the same treatment 🤔
      </Text>
      <BorderButton mt={2} fullWidth onClick={() => handleStrategy("defect")}>
        {defectEmoji} I want to be greedy! {defectEmoji}
      </BorderButton>
    </>
  );
}
