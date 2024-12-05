import { Image } from '@mantine/core';
import { useFullscreen } from '@mantine/hooks';
import React from 'react';

function ImageFullScreen(props) {
  const { ref, toggle, fullscreen } = useFullscreen();
  return <Image {...props} ref={ref} onClick={toggle} />;
}

export default ImageFullScreen;
