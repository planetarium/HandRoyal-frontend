const GLOVE_API_URL = import.meta.env.VITE_GLOVE_API_URL;
const RANKING_API_URL = import.meta.env.VITE_RANKING_API_URL;

export const registerGlove = (gloveAddress: string, file: File | null) =>
{
    const formData = new FormData();
    formData.append('gloveAddress', gloveAddress);
    if (file) {
        formData.append('file', file);
    }
    
    return fetch(
        `${GLOVE_API_URL}/register-glove`, {
            method: 'POST',
            body: formData,
        }
    );
}

export const getLocalGloveImage = (gloveId: string) => {
  try {
    return new URL(`/src/assets/gloves/${gloveId}.png`, import.meta.url).href;
  } catch (error) {
    console.error(`Failed to load glove image for ${gloveId}:`, error);
    return '';
  }
}

export const getGloveImage = (gloveId: string | null, hand: string) => {
  const url = gloveId
    ? `${GLOVE_API_URL}/get-glove-image?gloveAddress=${gloveId}&hand=${hand}`
    : `${GLOVE_API_URL}/get-glove-image?hand=${hand}`;

  return fetch(url, {
    method: 'GET',
  });
};

export const getRanking = async () => {
  return await fetch(`${RANKING_API_URL}/api/rank`);
};