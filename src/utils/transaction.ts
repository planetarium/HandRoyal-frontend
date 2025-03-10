import { request } from 'graphql-request';
import {
  GRAPHQL_ENDPOINT,
  unsignedTransactionQuery,
  stageTransactionMutation,
  transactionResultQuery
} from '../queries';
import type { IAccount } from '../context/AccountContext';

export async function executeTransaction(
  account: IAccount, plainValue: string) {
  if (!account.isConnected) {
    throw new Error('Account not connected');
  }

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
  const startTime = Date.now();
  const pollInterval = 1000;

  while (Date.now() - startTime < timeout) {
    const result = await request(GRAPHQL_ENDPOINT, transactionResultQuery, {
      txId: txId
    });

    if (!result.transaction?.transactionResult?.txStatus) {
      throw new Error('Transaction result not found');
    }

    const txStatus = result.transaction.transactionResult.txStatus;
    if (txStatus === 'SUCCESS') {
      return;
    }

    if (txStatus === 'FAILURE') {
      throw new Error(result.transaction.transactionResult.exceptionNames?.join(', ') || 'Transaction failed');
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Transaction timeout');
} 
