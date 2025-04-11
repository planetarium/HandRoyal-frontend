import { request } from 'graphql-request';
import {
  GRAPHQL_ENDPOINT,
  unsignedTransactionQuery,
  stageTransactionMutation,
  onTransactionChangedSubscription,
  createSessionAction,
  createUserAction,
  pickUpAction,
  pickUpManyAction,
  registerMatchingAction,
  cancelMatchingAction,
  joinSessionAction,
  submitMoveAction,
  registerGloveAction,
  refillActionPointAction
} from '../queries';
import subscriptionClient from '../subscriptionClient';
import { ActionName } from '../types/types';
import type { Account } from '../accounts/Account';

export async function executeAction(account: Account, actionName: ActionName, variables?: Record<string, any>) {
  let document;
  switch (actionName) {
    case ActionName.PICK_UP:
      document = pickUpAction;
      break;
    case ActionName.PICK_UP_MANY:
      document = pickUpManyAction;
      break;
    case ActionName.REGISTER_MATCHING:
      document = registerMatchingAction;
      break;
    case ActionName.CANCEL_MATCHING:
      document = cancelMatchingAction;
      break;
    case ActionName.JOIN_SESSION:
      document = joinSessionAction;
      break;
    case ActionName.SUBMIT_MOVE:
      document = submitMoveAction;
      break;
    case ActionName.REGISTER_GLOVE:
      document = registerGloveAction;
      break;
    case ActionName.CREATE_SESSION:
      document = createSessionAction;
      break;
    case ActionName.CREATE_USER:
      document = createUserAction;
      break;
    case ActionName.REFILL_ACTION_POINT:
      document = refillActionPointAction;
      break;
    default:
      throw new Error(`Unknown action: ${actionName}`);
  }

  const response = await request<Record<string, any>>(
    GRAPHQL_ENDPOINT,
    document,
    variables
  );

  const plainValue = response.actionQuery?.[actionName];
  if (plainValue) {
    const txId = await executeTransaction(account, plainValue);
    await waitForTransaction(txId);
    return txId;
  }

  return undefined;
}

async function executeTransaction(
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
