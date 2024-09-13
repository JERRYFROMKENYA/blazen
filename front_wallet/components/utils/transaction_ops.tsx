// `components/utils/transaction_ops.ts`

export async function getTransactionsForLoggedInUser(user: any, pb: any) {
  if (!user || !pb) {
    return null;
  }

  try {
    const transactions = await pb.collection('customer_quotes').getFullList({
      filter: `rfq.metadata.from="${user.did}"`,
      expand: 'pfi',
    });
    return transactions;
  } catch (error) {
    // console.error('Error getting transactions for logged-in user:', error);
    return null;
  }
}