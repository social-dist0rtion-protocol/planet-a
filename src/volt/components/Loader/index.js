import React from 'react'
import { FullScreenContainer } from "../Common";
import { DeoraLogo } from "../Menu/styles";
import { ProgressBar, LoaderContainer} from "./styles";

const Loader = () => {
  return(
    <FullScreenContainer>
      <LoaderContainer>
        <DeoraLogo mb={5} animated/>
        <ProgressBar/>
      </LoaderContainer>
    </FullScreenContainer>
  )
};

export default Loader
