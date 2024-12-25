import {useCPK} from 'cpk-ui';
import {G, Path, Svg} from 'react-native-svg';

type Props = {
  color?: string;
};

export default function SvgStatsFire({color}: Props) {
  const {theme} = useCPK();
  const fill = color || theme.text.basic;

  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <G opacity="1.0">
        <Path
          d="M4.97939 4.71436L16.2572 13.2001L10.0778 18.1651L3.89844 13.2001L4.97939 4.71436Z"
          fill={fill}
        />
        <Path
          d="M9.16665 1.34912L11.019 4.24277L9.16665 5.73007L7.31586 4.24277L9.16665 1.34912Z"
          fill={fill}
        />
        <Path
          d="M15.1746 3.25073L10.6953 6.91264L16.2699 11.1079L15.1746 3.25073Z"
          fill={fill}
        />
      </G>
    </Svg>
  );
}
