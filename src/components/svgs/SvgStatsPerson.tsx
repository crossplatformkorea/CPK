import {useDooboo} from 'dooboo-ui';
import {G, Path, Svg} from 'react-native-svg';

type Props = {
  color?: string;
};

export default function SvgStatsPerson({color}: Props) {
  const {theme} = useDooboo();
  const fill = color || theme.text.basic;

  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <G opacity="1.0">
        <Path
          d="M17.2222 12.0904L10.238 16.446V7.73486L17.2222 12.0904Z"
          fill={fill}
        />
        <Path
          d="M2.61902 14.9096L8.47299 11.2588V18.5604L2.61902 14.9096Z"
          fill={fill}
        />
        <Path
          d="M12.565 6.86981C13.8704 6.86981 14.9285 5.81164 14.9285 4.50631C14.9285 3.20099 13.8704 2.14282 12.565 2.14282C11.2597 2.14282 10.2015 3.20099 10.2015 4.50631C10.2015 5.81164 11.2597 6.86981 12.565 6.86981Z"
          fill={fill}
        />
        <Path
          d="M6.44129 10.3967C7.56339 10.3967 8.47304 9.4871 8.47304 8.365C8.47304 7.2429 7.56339 6.33325 6.44129 6.33325C5.31919 6.33325 4.40955 7.2429 4.40955 8.365C4.40955 9.4871 5.31919 10.3967 6.44129 10.3967Z"
          fill={fill}
        />
      </G>
    </Svg>
  );
}
