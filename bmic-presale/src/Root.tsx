import { Composition, Still } from "remotion";
import { BmicPresale } from "./BmicPresale";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Still image for the presale banner */}
      <Still
        id="BmicPresaleStill"
        component={BmicPresale}
        width={1920}
        height={1080}
      />

      {/* Animated version */}
      <Composition
        id="BmicPresaleVideo"
        component={BmicPresale}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
