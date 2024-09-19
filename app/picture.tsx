import {useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {css} from '@emotion/native';
import {IconButton} from 'dooboo-ui';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import CustomLoadingIndicator from '../src/components/uis/CustomLoadingIndicator';
import Wrapper from '../src/components/uis/Wrapper';
import ImageZoomView from '../src/components/uis/ImageZoomView';
import {isDesktopDevice} from '../src/utils/common';
import {t} from '../src/STRINGS';
import ErrorBoundary from 'react-native-error-boundary';
import FallbackComponent from '../src/components/uis/FallbackComponent';

export default function Picture(): JSX.Element {
  const {imageUrl} = useLocalSearchParams();
  const {top, right} = useSafeAreaInsets();
  const {back} = useRouter();
  const [loading, setLoading] = useState(true);

  if (!imageUrl || typeof imageUrl !== 'string') {
    return (
      <>
        <Stack.Screen
          options={{headerShown: false, title: t('common.picture')}}
        />
        <CustomLoadingIndicator />
      </>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Stack.Screen
        options={{headerShown: false, title: t('common.picture')}}
      />
      <Wrapper>
        <View
          style={css`
            flex: 1;
          `}
        >
          <>
            {loading ? (
              <ActivityIndicator
                size="large"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              />
            ) : null}
            <ImageZoomView
              onLoadEnd={() => {
                setLoading(false);
              }}
              style={css`
                opacity: ${loading ? 0 : 1};
              `}
              uri={decodeURIComponent(imageUrl)}
            />
          </>
          <IconButton
            color="light"
            icon="X"
            onPress={() => {
              back();
            }}
            style={css`
              position: absolute;
              right: ${right + 6 + 'px'};
              top: ${isDesktopDevice() ? '12px' : top + 'px'};
            `}
            type="text"
          />
        </View>
      </Wrapper>
    </ErrorBoundary>
  );
}
