import {
  ActionIcon,
  Box,
  Center,
  Group,
  Image,
  Loader,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import ImageFullScreen from '../../components/ImageFullScreen';
import {
  useGetInvoiceImages,
  useGetTransactionImage,
} from '../../helpers/apiHelper';

function PreviewImages({ keyImage, id }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const isInvoice = keyImage === 'invoice';
  const { data, isLoading, error, isFetching } = useQuery(
    [`${keyImage}-image`, id],
    () => (isInvoice ? useGetInvoiceImages(id) : useGetTransactionImage(id)),
    {
      onSuccess: (res) => {
        if (res?.code === 200 && res?.response?.length > 0) {
          setSelectedImage(res?.response[0]);
        }
      },
    }
  );

  const handleDownload = () => {
    const imageUrl = `https://dev.arieslibre.my.id/api/v1/public/${keyImage}/download/${id}/${selectedImage}`;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = selectedImage;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const dataNotFound = data?.response?.length === 0;
  const isPdf = (selectedImage || '').toLowerCase().endsWith('.pdf');

  return (
    <Box>
      {isLoading && (
        <Center h={300}>
          <Loader />
        </Center>
      )}

      {!isLoading && !error && dataNotFound && (
        <Center h={300}>
          <Text>No Images</Text>
        </Center>
      )}

      {!isLoading && !error && !dataNotFound && (
        <>
          <Box pos="relative">
            {isPdf ? (
              <Box w="100%" h={500} style={{ overflow: 'hidden' }}>
                <object
                  data={`https://dev.arieslibre.my.id/api/v1/public/${keyImage}/view/${id}/${selectedImage}#toolbar=0&scrollbar=0`}
                  type="application/pdf"
                  aria-label="Invoice Preview"
                  width={'100%'}
                  height={'101%'}
                  style={{ overflow: 'hidden' }}
                >
                  <p>
                    Your browser does not support PDFs. Please{' '}
                    <a
                      href={`https://dev.arieslibre.my.id/api/v1/public/${keyImage}/view/${id}/${selectedImage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      download the PDF
                    </a>{' '}
                    to view it.
                  </p>
                </object>
              </Box>
            ) : (
              <ImageFullScreen
                w="100%"
                h={500}
                fit="contain"
                radius="sm"
                src={`https://dev.arieslibre.my.id/api/v1/public/${keyImage}/download/${id}/${selectedImage}`}
              />
            )}

            <Tooltip label="Download">
              <ActionIcon
                color="blue"
                size="lg"
                radius="sm"
                pos="absolute"
                right={8}
                top={8}
                onClick={handleDownload}
              >
                <IconDownload strokeWidth={3} size={18} />
              </ActionIcon>
            </Tooltip>
          </Box>
          <Box h={8} />
          <Group gap="xs">
            {data?.response?.map((item, i) => {
              const isPdf = item.toLowerCase().endsWith('.pdf');
              const key = item + i;

              const handleClick = () => {
                setSelectedImage(item);
              };

              return (
                <div
                  key={key}
                  onClick={handleClick}
                  style={{
                    position: 'relative',
                    width: 50,
                    height: 50,
                    cursor: 'pointer',
                  }}
                >
                  {isPdf ? (
                    <>
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
                          zIndex: 10, // Higher z-index to ensure overlay is on top
                          border:
                            selectedImage === item
                              ? '2px solid var(--mantine-color-red-5)'
                              : 'none',
                          transform:
                            selectedImage === item ? 'scale(1.2)' : 'scale(1)',
                          transition: 'transform 0.1s ease-out',
                        }}
                      />
                      <object
                        data={`https://dev.arieslibre.my.id/api/v1/public/${keyImage}/view/${id}/${item}`}
                        type="application/pdf"
                        aria-label="Invoice Preview"
                        width={'100%'}
                        height={'100%'}
                        style={{
                          borderRadius: 4,
                          overflow: 'hidden',
                          position: 'absolute', // Ensures the object stays in the same space
                          top: 0,
                          left: 0,
                          zIndex: 1, // Lower z-index so the overlay can sit on top
                        }}
                      />
                    </>
                  ) : (
                    <Image
                      w={50}
                      h={50}
                      bg={'dark.8'}
                      fit="contain"
                      radius={4}
                      src={`https://dev.arieslibre.my.id/api/v1/public/${keyImage}/download/${id}/${item}`}
                      style={{
                        border:
                          selectedImage === item
                            ? '2px solid var(--mantine-color-red-5)'
                            : 'none',
                        transform:
                          selectedImage === item ? 'scale(1.2)' : 'scale(1)',
                        transition: 'transform 0.1s ease-out',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </Group>
        </>
      )}
    </Box>
  );
}

export default PreviewImages;
