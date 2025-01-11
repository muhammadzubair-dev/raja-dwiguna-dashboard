import {
  ActionIcon,
  Box,
  Group,
  Image,
  Indicator,
  Stack,
  Text,
  Tooltip,
  rem,
} from '@mantine/core';
import {
  IconUpload,
  IconPhoto,
  IconX,
  IconMinimize,
  IconMinus,
  IconDownload,
} from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { useState } from 'react';
import ImageFullScreen from '../ImageFullScreen';

function UploadImage(props) {
  const {
    files,
    setFiles,
    setDeletedFiles,
    hImage = 50,
    wImage = 50,
    disableUpload = false,
    disableActions = false,
    hasDownload = false,
  } = props;

  const previews = files.map((file, index) => {
    const isImageUrl = typeof file === 'string';
    let isPdf = false;
    if (isImageUrl) {
      isPdf = file.toLowerCase().endsWith('.pdf');
    } else {
      isPdf = file.type === PDF_MIME_TYPE[0];
    }

    const handleDownload = () => {
      const a = document.createElement('a');
      a.href = file;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    return (
      <Box pos="relative">
        {!disableActions && (
          <ActionIcon
            color="red"
            size="xs"
            radius="sm"
            pos="absolute"
            right={0}
            top={0}
            onClick={() => {
              setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
              if (isImageUrl) {
                setDeletedFiles((prevFiles) => [
                  ...prevFiles,
                  file.split('/').pop(),
                ]);
              }
            }}
          >
            <IconX size={12} />
          </ActionIcon>
        )}

        {hasDownload && (
          <Tooltip label="Download">
            <ActionIcon
              color="blue"
              size="sm"
              radius="sm"
              pos="absolute"
              right={4}
              top={4}
              onClick={handleDownload}
            >
              <IconDownload strokeWidth={3} size={14} />
            </ActionIcon>
          </Tooltip>
        )}

        <ImageFullScreen
          radius="sm"
          key={index}
          src={
            isPdf
              ? 'https://placehold.co/100x70/101113/FFF?text=pdf&font=lato'
              : isImageUrl
              ? file
              : URL.createObjectURL(file)
          }
          w={wImage}
          fit="contain"
          bg="dark.9"
          h={hImage}
          onLoad={() =>
            !isImageUrl && URL.revokeObjectURL(URL.createObjectURL(file))
          }
        />
      </Box>
    );
  });

  return (
    <Stack gap={2}>
      <Text size="sm">Upload Image</Text>
      {!disableUpload && (
        <Dropzone
          // onDrop={(files) => console.log('accepted files', files)}
          onDrop={(files) => setFiles((prevFile) => [...prevFile, ...files])}
          onReject={(files) => console.log('rejected files', files)}
          maxSize={5 * 1024 ** 2}
          accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
          {...props}
        >
          <Group
            justify="center"
            gap="md"
            mih={80}
            style={{ pointerEvents: 'none' }}
          >
            <Dropzone.Accept>
              <IconUpload
                style={{
                  width: rem(42),
                  height: rem(42),
                  color: 'var(--mantine-color-blue-6)',
                }}
                stroke={1.5}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                style={{
                  width: rem(42),
                  height: rem(42),
                  color: 'var(--mantine-color-red-6)',
                }}
                stroke={1.5}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto
                style={{
                  width: rem(42),
                  height: rem(42),
                  color: 'var(--mantine-color-dimmed)',
                }}
                stroke={1.5}
              />
            </Dropzone.Idle>

            <div>
              <Text size="sm" inline>
                Drag images here or click to select files
              </Text>
              <Text size="xs" c="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed
                5mb
              </Text>
            </div>
          </Group>
        </Dropzone>
      )}
      {files.length > 0 && (
        <Group position="center" my="xs" gap={8}>
          {previews}
        </Group>
      )}
    </Stack>
  );
}

export default UploadImage;
