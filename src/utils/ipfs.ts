// Real IPFS integration using Pinata

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadToIPFS = async (file: File): Promise<string> => {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT not configured. Please add VITE_PINATA_JWT to .env file');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinata upload failed: ${error}`);
    }

    const result = await response.json();
    return result.IpfsHash;
  } catch (error: any) {
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

export const uploadTextToIPFS = async (text: string): Promise<string> => {
  if (!PINATA_JWT) {
    throw new Error('Pinata JWT not configured');
  }

  try {
    const blob = new Blob([text], { type: 'text/plain' });
    const file = new File([blob], 'comment.txt', { type: 'text/plain' });

    return await uploadToIPFS(file);
  } catch (error: any) {
    throw new Error(`Failed to upload text to IPFS: ${error.message}`);
  }
};

export const getFromIPFS = async (hash: string): Promise<string> => {
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');

    if (contentType?.startsWith('image/')) {
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }

    const text = await response.text();
    return text;
  } catch (error: any) {
    throw new Error(`Failed to fetch from IPFS: ${error.message}`);
  }
};

export const getImageUrl = (hash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};
