import React from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity, Text, Linking, LayoutChangeEvent } from 'react-native';
import { NativeIcon } from './NativeIcon';
import { COLORS } from '../../constants/theme';

interface Props {
  images: string[];
  videos?: string[];
}

export function MediaCarousel({ images, videos = [] }: Props) {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const allMediaLength = images.length + videos.length;

  if (allMediaLength === 0) {
    return (
      <View style={[styles.image, styles.imagePlaceholder]}>
        <NativeIcon name="image-outline" size={48} color={COLORS.gray400} />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {images.map((uri, idx) => (
          <View key={`img-${idx}`} style={[styles.slide, { width: containerWidth || '100%' }]}>
            <Image source={{ uri }} style={styles.image} resizeMode="contain" />
          </View>
        ))}
        {videos.map((url, idx) => (
          <View key={`vid-${idx}`} style={[styles.slide, styles.videoContainer, { width: containerWidth || '100%' }]}>
            <NativeIcon name="play-circle-outline" size={64} color={COLORS.white} />
            <TouchableOpacity style={styles.playBtn} onPress={() => Linking.openURL(url).catch(() => null)}>
              <Text style={styles.playText}>تشغيل الفيديو</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      {allMediaLength > 1 && (
        <View style={styles.indicatorContainer}>
           <Text style={styles.indicatorText}>اسحب للمزيد ({allMediaLength})</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 300,
    backgroundColor: COLORS.gray100,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    height: 300,
  },
  image: { 
    width: '100%', 
    height: '100%', 
  },
  imagePlaceholder: { 
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    height: 300,
    backgroundColor: COLORS.gray100,
  },
  videoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2B2B2B',
  },
  playBtn: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  playText: {
    color: '#F6F2E8',
    fontWeight: 'bold',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(13,59,70,0.72)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  indicatorText: {
    color: '#F6F2E8',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

