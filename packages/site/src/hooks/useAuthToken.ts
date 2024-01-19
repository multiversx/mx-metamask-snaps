import { useState } from 'react';
import { authTokenSnap } from '../utils';

export const useAuthToken = () => {
  const [authToken, setAuthToken] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const authentification = async (data: FormData) => {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const token = data.get('token');

      if (typeof token === 'string') {
        const tokenSigned = await authTokenSnap(token);

        if (tokenSigned) {
          setAuthToken(tokenSigned);
        }
      }
    } catch (err: unknown) {
      console.log(`An unknown error occurred: ${JSON.stringify(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { authToken, isLoading, authentification };
};
