import {useCPK} from 'cpk-ui';
import {G, Path, Svg} from 'react-native-svg';

type Props = {
  color?: string;
};

export default function SvgStatsGold({color}: Props) {
  const {theme} = useCPK();
  const fill = color || theme.text.basic;

  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <G opacity="1.0">
        <Path
          d="M3.65558 9.78738L9.89526 1.69214L16.1334 9.78738L9.89526 17.8826L3.65558 9.78738Z"
          fill={fill}
        />
        <Path
          d="M14.4698 14.5777L16.2445 12.2761L18.0175 14.5777L16.2445 16.8793L14.4698 14.5777Z"
          fill={fill}
        />
        <Path
          d="M2.89685 4.94596L4.18098 3.2793L5.4651 4.94596L4.18098 6.61263L2.89685 4.94596Z"
          fill={fill}
        />
      </G>
    </Svg>
  );
}
