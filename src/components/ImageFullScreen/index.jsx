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
      <Box
        w={props.w}
        h={props.h}
        ref={ref}
        onClick={() => window.open(file)}
        style={{
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            borderRadius: 4,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
            zIndex: 2, // Higher z-index to ensure overlay is on top
          }}
        />
        <object
          data={
            isImageUrl
              ? file
              : URL.createObjectURL(file) + '#toolbar=0&scrollbar=0'
          }
          type="application/pdf"
          aria-label="Invoice Preview"
          width={'100%'}
          height={'100%'}
          style={{
            borderRadius: 4,
            position: 'absolute',
            overflow: 'hidden',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
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
