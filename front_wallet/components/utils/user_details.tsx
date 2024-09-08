// `components/utils/user_details.tsx`

import { fetchVCIssuerURL, requestVC, storeCustomerVC, checkExistingVC } from "@/components/utils/vc_operations";

export async function generateVC(user: any, pb: any) {
  if (!user || !pb) {
    throw new Error('User not logged in or PocketBase not initialized');
  }

  try {
    // Check if the user already has a VC from the issuer


    const userDetails = await pb.collection('users').getOne(user.id);
    const { name, country } = userDetails;
    const didResponse = await pb.collection('customer_did').getFirstListItem(`user="${user.id}" && type="dht"`);
    const did = didResponse.did.document.id;
    console.log(did);
    const url = await fetchVCIssuerURL(pb, 'Ultimate Identity');
    if (!url) {
      throw new Error('Error fetching VC Issuer URL');
    }
    const vc = await requestVC(url, name.replaceAll(" ", "%20"), country, did);
    if (!vc) {
      throw new Error('Error requesting VC');
    }
    const issuer = await pb.collection('vc_issuer').getFirstListItem(`name="Ultimate Identity"`);

    return await storeCustomerVC(user, pb, vc.replaceAll("{","").replaceAll("}",""), 'Ultimate Identity VC', 'Verification', issuer.id);
  } catch (error) {
    console.error('Error generating VC:', error);
    return null;
  }
}