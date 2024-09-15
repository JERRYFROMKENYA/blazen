// `components/utils/wallet_ops.ts`

export async function createWallet(user: any, pb: any, balance: number, address: string, type: string, currency: string, provider: string = "kimera") {
  if (!user || !pb) {
    throw new Error('User not logged in or PocketBase not initialized');
  }

  try {
    const response = await pb.collection('wallet').create({
      user: user.id,
      balance: balance,
      address: address,
      provider: provider,
      type: type,
      currency: currency,
    });
    return response;
  } catch (error) {
    // console.error('Error creating wallet:', error);
    return null;
  }
}




export async function getWalletsForLoggedInUser(user: any, pb: any) {
  if (!user || !pb) {
    return
    // throw new Error('User not logged in or PocketBase not initialized');
  }

  try {
    const wallets = await pb.collection('wallet').getFullList({
      filter: `user="${user.id}"`,
      expand:'user'
    });
    return wallets;
  } catch (error) {
    // console.error('Error getting wallets for logged-in user:', error);
    return null;
  }
}