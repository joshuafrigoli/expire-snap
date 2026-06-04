import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export async function compressImage(uri) {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.8, format: SaveFormat.JPEG, base64: true }
  );
  return { uri: result.uri, base64: result.base64 };
}
