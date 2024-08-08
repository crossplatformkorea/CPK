import { useDooboo } from 'dooboo-ui';
import {Svg, G, Path, Defs, ClipPath, Rect} from 'react-native-svg';

type Props = {
  color?: string;
};

export default function SvgStatsDooboo({color}: Props) {
  const {theme} = useDooboo();
  const fill = color || theme.text.basic;

  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <G clipPath="url(#clip0_490_628)">
        <Path
          d="M10 1.26978L2.4397 5.63485V14.365L10 18.7301L17.5603 14.365V5.63485L10 1.26978ZM16.0175 13.4745L10 16.9491L3.98255 13.4745V6.52533L10 3.05072L16.0175 6.52533V13.4745Z"
          fill={fill}
        />
        <Path
          d="M5.52539 7.41579V12.584L9.99999 15.1666L14.4746 12.584V7.41579L9.99999 4.83325L5.52539 7.41579Z"
          fill={fill}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_490_628">
          <Rect width="20" height="20" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
