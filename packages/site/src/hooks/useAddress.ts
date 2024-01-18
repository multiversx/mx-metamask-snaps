import { useEffect, useState } from 'react';
import { getAddressSnap } from '../utils';

export const useAddress = (isSnapInstalled: boolean) => {
  const [address, setAddress] = useState<string | undefined>();

  useEffect(() => {
    if (isSnapInstalled) {
      (async () => {
        const addressResponse = await getAddressSnap();
        if (addressResponse) {
          setAddress(addressResponse);
        }
      })();
    }
  }, [isSnapInstalled]);

  return { address };
};
