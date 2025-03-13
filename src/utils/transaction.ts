import { request } from 'graphql-request';
import {
  GRAPHQL_ENDPOINT,
  unsignedTransactionQuery,
  stageTransactionMutation,
  onTransactionChangedSubscription,
} from '../queries';
import subscriptionClient from '../subscriptionClient';
import type { Account } from '../accounts/Account';

export async function executeTransaction(
  account: Account, plainValue: string) {
  const unsignedTransactionResponse = await request(GRAPHQL_ENDPOINT, unsignedTransactionQuery, {
    address: account.address.toString(),
    plainValue: plainValue
  });
  if (!unsignedTransactionResponse.transaction?.unsignedTransaction) {
    throw new Error('Failed to get unsigned transaction');
  }

  const unsignedTransaction = unsignedTransactionResponse.transaction.unsignedTransaction;
  const signature = await account.sign(unsignedTransaction);

  const response = await request(GRAPHQL_ENDPOINT, stageTransactionMutation, {
    unsignedTransaction: unsignedTransaction,
    signature: signature
  });

  if (!response.stageTransaction) {
    throw new Error('Failed to stage transaction');
  }

  return response.stageTransaction;
}

export async function waitForTransaction(txId: string, timeout: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    const unsubscribe = subscriptionClient.subscribe({
      query: onTransactionChangedSubscription, // Define this query in your queries file
      variables: { txId: txId },
    }, {
      next: (result) => {
        const data = result.data as {
          onTransactionChanged: {
            status: string,
            exceptionNames: string[]
          }
        };
        const status = data.onTransactionChanged.status;
        const exceptionNames = data.onTransactionChanged.exceptionNames;

        if (status === 'SUCCESS') {
          unsubscribe();
          resolve();
        } else if (status === 'FAILURE') {
          const errorMessage = exceptionNames?.join(', ') || 'Transaction failed';
          unsubscribe();
          reject(new Error(errorMessage));
        }
      },
      error: (error) => {
        unsubscribe();
        reject(error);
      },
      complete: () => {
      }
    });

    // 타임아웃 처리
    setTimeout(() => {
      unsubscribe();
      reject(new Error('Transaction timeout'));
    }, timeout);
  });
} 
