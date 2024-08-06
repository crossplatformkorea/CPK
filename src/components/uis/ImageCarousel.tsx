import {useCallback, useEffect, useState} from 'react';
import type {ViewStyle} from 'react-native';
import {Pressable, View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import {css} from '@emotion/native';
import {Icon, Typography, useDooboo} from 'dooboo-ui';
import type {ImageStyle} from 'expo-image';
import {Image as ExpoImage} from 'expo-image';
import {useRouter} from 'expo-router';
import {Image} from '../../types';
import {generateThumbnailFromVideo} from '../../utils/common';
import { delayPressIn } from '../../utils/constants';

type Styles = {
  container?: ViewStyle;
  image?: ImageStyle;
};

type Props = {
  style?: ViewStyle;
  styles?: Styles;
  width?: number;
  height: number;
  images: Image[];
  borderRadius?: number;
};

function ImageCarouselItem({
  images,
  height,
  index,
  item,
  styles,
  borderRadius = 0,
}: Omit<Props, 'style' | 'width'> & {
  index: number;
  item: Image;
  borderRadius?: number;
}): JSX.Element {
  const {theme} = useDooboo();
  const {push} = useRouter();
  const [uri, setUri] = useState<string | undefined>();

  useEffect(() => {
    // Correctly recycle images in `FlashList` when the image is changed.
    // https://github.com/Shopify/flash-list/issues/749
    setUri(
      item?.thumb_url
        ? item.thumb_url
        : item.type === 'Video'
          ? (item.url as string)
          : (item?.thumb_url as string) || (item.image_url as string),
    );
  }, [item]);

  const generateVideoThumbnailIfVideo = useCallback(async (): Promise<void> => {
    if (item && item.type === 'Video' && item.url && !item.thumb_url) {
      const thumbUri = await generateThumbnailFromVideo(item.url);

      setUri(thumbUri);
    }
  }, [item]);

  useEffect(() => {
    generateVideoThumbnailIfVideo();
  }, [generateVideoThumbnailIfVideo, item]);

  return (
    <View
      style={[
        css`
          height: ${height + 'px'};
          justify-content: center;
          align-items: center;
        `,
        styles?.container,
      ]}
    >
      <Pressable
        delayHoverIn={delayPressIn}
        onPress={() => {
          // if (item.type === 'Video') {
          //   return push({
          //     pathname: '/video',
          //     params: {
          //       uri: encodeURIComponent(item.url as string),
          //     },
          //   });
          // }

          return push({
            pathname: '/picture',
            params: {
              imageUrl: encodeURIComponent(item.image_url as string),
            },
          });
        }}
        style={css`
          height: ${height + 'px'};
          width: ${height + 'px'};
        `}
      >
        {uri ? (
          <ExpoImage
            contentFit="cover"
            recyclingKey={uri}
            source={{uri}}
            style={[
              {flex: 1, alignSelf: 'stretch', borderRadius},
              styles?.image ?? {},
            ]}
          />
        ) : (
          <View
            style={css`
              min-height: 280px;
              flex: 1;
              align-self: stretch;
              justify-content: center;
              align-items: center;
              background-color: ${theme.bg.disabled};
            `}
          >
            {item.type === 'Video' ? (
              <Icon color={theme.text.label} name="Play" size={40} />
            ) : (
              <Icon color={theme.text.placeholder} name="Image" size={40} />
            )}
          </View>
        )}
      </Pressable>
      {/* 오른쪽 상단 Index 표시 */}
      {images.length > 1 ? (
        <View
          style={css`
            background-color: ${theme.bg.basic};
            border-radius: 12px;
            padding: 6px;

            top: 12px;
            right: 12px;
            position: absolute;
          `}
        >
          <Typography.Body4>{`${
            index + 1
          } / ${images?.length}`}</Typography.Body4>
        </View>
      ) : null}
      {/* 비디오면 왼쪽 상단 표시 */}
      {item.type === 'Video' ? (
        <View
          style={css`
            position: absolute;
            bottom: 6px;
            left: 6px;
            padding: 4px;
            border-radius: 8px;
            background-color: ${theme.bg.paper};

            flex-direction: row;
            align-items: center;
          `}
        >
          <Icon color={theme.text.basic} name="VideoCamera" size={16} />
          <Typography.Body4
            style={css`
              color: ${theme.text.basic};
              margin-left: 4px;
            `}
          >
            {`${((item.duration || 0) / 1000).toFixed(2).toLocaleString()}s`}
          </Typography.Body4>
        </View>
      ) : null}
    </View>
  );
}

export default function ImageCarousel(
  props: Omit<Props, 'height' | 'width'>,
): JSX.Element {
  const {style, styles, images, borderRadius} = props;
  const {theme} = useDooboo();
  const [layoutWidth, setLayoutWidth] = useState(1);
  const height = layoutWidth === 1 ? 330 : layoutWidth;

  return (
    <Animated.View
      entering={FadeIn}
      onLayout={({nativeEvent}) => {
        setLayoutWidth(nativeEvent.layout.width || layoutWidth);
      }}
      style={[
        css`
          height: ${height} + 'px';
          opacity: ${layoutWidth === 1 ? 0 : 1};

          flex-direction: row;
        `,
        style,
      ]}
    >
      {images.length === 1 ? (
        <ImageCarouselItem
          borderRadius={borderRadius}
          height={height}
          images={images}
          index={0}
          item={images[0]}
          styles={styles}
        />
      ) : (
        <Carousel
          autoPlay={false}
          data={images}
          height={height}
          loop={false}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9999,
            parallaxScrollingOffset: 10,
            parallaxAdjacentItemScale: 0.8,
          }}
          // https://github.com/dohooo/react-native-reanimated-carousel/issues/125#issuecomment-1022276126
          panGestureHandlerProps={{
            activeOffsetX: [-10, 10],
          }}
          renderItem={({item, index}) => (
            <ImageCarouselItem
              {...props}
              borderRadius={borderRadius}
              height={height}
              index={index}
              item={item}
            />
          )}
          scrollAnimationDuration={1000}
          style={[
            css`
              height: ${height + 'px'};
              background-color: ${theme.bg.basic};
            `,
          ]}
          width={layoutWidth}
        />
      )}
    </Animated.View>
  );
}
