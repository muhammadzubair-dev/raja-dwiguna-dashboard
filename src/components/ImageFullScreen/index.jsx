import { Box, Image } from '@mantine/core';
import { PDF_MIME_TYPE } from '@mantine/dropzone';
import { useFullscreen } from '@mantine/hooks';
import React from 'react';

function ImageFullScreen(props) {
  const { ref, toggle, fullscreen } = useFullscreen();
  const file = props.src;
  const isImageUrl = typeof file === 'string';
  let isPdf = false;
  if (isImageUrl) {
    isPdf = file.toLowerCase().endsWith('.pdf');
  } else {
    isPdf = file.type === PDF_MIME_TYPE[0];
  }

  if (isPdf) {
    return (
      <Box w={props.w} h={props.h} onClick={toggle}>
        <object
          ref={ref}
          data={isImageUrl ? file : URL.createObjectURL(file)}
          type="application/pdf"
          aria-label="Invoice Preview"
          width={'100%'}
          height={'100%'}
          style={{ overflow: 'hidden' }}
        >
          <p>
            Your browser does not support PDFs. Please{' '}
            <a href={file} target="_blank" rel="noopener noreferrer">
              download the PDF
            </a>{' '}
            to view it.
          </p>
        </object>
      </Box>
    );
  }

  return (
    <Image
      style={{ cursor: 'pointer' }}
      {...props}
      ref={ref}
      onClick={toggle}
      src={isImageUrl ? file : URL.createObjectURL(file)}
      onLoad={() =>
        !isImageUrl && URL.revokeObjectURL(URL.createObjectURL(file))
      }
    />
  );
}

export default ImageFullScreen;
