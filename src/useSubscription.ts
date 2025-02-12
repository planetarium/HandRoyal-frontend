import { useEffect, useState } from 'react';
import subscriptionClient from './subscriptionClient';

const useSubscription = (query: string, variables = {}, callback: (data: any) => void) => {
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    const subscribe = async () => {
      unsubscribe = subscriptionClient.subscribe(
        {
          query,
          variables,
        },
        {
          next: (result) => callback(result.data),
          error: (err) => setError(err),
          complete: () => {},
        }
      );
    };

    subscribe();

    return () => {
      unsubscribe();
    };
  }, [query, variables, callback]);

  return { query, error, callback };
};

export default useSubscription;