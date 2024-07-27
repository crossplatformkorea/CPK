import type {LottieComponentProps, LottieOptions} from 'lottie-react';
import {useLottie} from 'lottie-react';

import CpkLoading from '../../../assets/lotties/cpk_loading.json';

import type {LottieSourceType} from './LottieView';

function LottieView(
  _: Omit<LottieComponentProps, 'source'> & {
    type?: LottieSourceType;
  },
): JSX.Element {
  const options: LottieOptions = {
    animationData: CpkLoading,
    loop: true,
  };

  const {View, setSpeed} = useLottie(options, {
    marginTop: 12,
    marginBottom: 12,
    width: 72,
    height: 72,
    alignSelf: 'center',
  });

  setSpeed(2);

  return View;
}

export default LottieView;
