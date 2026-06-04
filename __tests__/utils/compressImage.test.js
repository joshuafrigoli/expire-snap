import { compressImage } from '@/utils/compressImage';
import * as ImageManipulator from 'expo-image-manipulator';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg' },
}));

const mockManipulateResult = { uri: 'file://compressed.jpg', base64: 'base64string==' };

describe('compressImage', () => {
  beforeEach(() => {
    ImageManipulator.manipulateAsync.mockResolvedValue(mockManipulateResult);
  });

  it('calls manipulateAsync with resize to max 1200px width', async () => {
    await compressImage('file://original.jpg');
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      'file://original.jpg',
      expect.arrayContaining([
        expect.objectContaining({ resize: expect.objectContaining({ width: 1200 }) }),
      ]),
      expect.any(Object)
    );
  });

  it('calls manipulateAsync with JPEG format and quality 0.8', async () => {
    await compressImage('file://original.jpg');
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.objectContaining({ compress: 0.8, format: 'jpeg', base64: true })
    );
  });

  it('returns compressed uri and base64', async () => {
    const result = await compressImage('file://original.jpg');
    expect(result.uri).toBe('file://compressed.jpg');
    expect(result.base64).toBe('base64string==');
  });

  it('throws if manipulateAsync fails', async () => {
    ImageManipulator.manipulateAsync.mockRejectedValueOnce(new Error('disk full'));
    await expect(compressImage('file://original.jpg')).rejects.toThrow('disk full');
  });
});
