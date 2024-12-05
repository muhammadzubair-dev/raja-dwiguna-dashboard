import {
  ActionIcon,
  Box,
  Group,
  Image,
  Indicator,
  Stack,
  Text,
  rem,
} from '@mantine/core';
import {
  IconUpload,
  IconPhoto,
  IconX,
  IconMinimize,
  IconMinus,
} from '@tabler/icons-react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useState } from 'react';

function UploadImage(props) {
  const { files, setFiles } = props;
  // const [files, setFiles] = useState([]);
  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Box pos="relative">
        <ActionIcon
          color="red"
          size="xs"
          radius="xl"
          pos="absolute"
          right={-8}
          top={-8}
          onClick={() =>
            setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
          }
        >
          <IconX size={12} />
        </ActionIcon>
        <Image
          radius="sm"
          key={index}
          src={imageUrl}
          w={40}
          onLoad={() => URL.revokeObjectURL(imageUrl)}
        />
      </Box>
    );
  });
  return (
    <Stack gap={2}>
      <Text size="sm">Upload Image</Text>
      <Dropzone
        // onDrop={(files) => console.log('accepted files', files)}
        onDrop={(files) => setFiles((prevFile) => [...prevFile, ...files])}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={5 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
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
              Attach as many files as you like, each file should not exceed 5mb
            </Text>
          </div>
        </Group>
      </Dropzone>
      <Group position="center" my="xs">
        {previews}
      </Group>
    </Stack>
  );
}

export default UploadImage;
