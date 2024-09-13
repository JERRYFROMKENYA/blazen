// `components/utils/vc_operations.tsx`

import { usePocketBase } from "@/components/Services/Pocketbase";
import { useAuth } from "@/app/(auth)/auth";

const BASE_URL = 'http://138.197.89.72:3000';

export async function fetchVCIssuerURL(pb: any, issuerName: string) {
  try {
    const response = await pb.collection('vc_issuer').getFirstListItem(`name="${issuerName}"`);
    if (!response) {
      throw new Error(`Issuer with name ${issuerName} not found`);
    }
    return response.url;
  } catch (error) {
    // console.error('Error fetching VC Issuer URL:', error);
    return null;
  }
}
export async function fetchVCIssuerURLById(pb: any, id: string) {
  try {
    const response = await pb.collection('vc_issuer').getFirstListItem(`id="${id}"`);
    if (!response) {
      throw new Error(`Issuer with id ${id} not found`);
    }
    return response.url;
  } catch (error) {
    // console.error('Error fetching VC Issuer URL:', error);
    return null;
  }
}

// `components/utils/vc_operations.tsx`

export async function requestVC(url: string, customerName: string, countryCode: string, customerDID: string) {
  try {
    const requestUrl = url.replace('${customerName}', customerName)
                          .replace('${countryCode}', countryCode)
                          .replace('${customerDID}', customerDID);
    console.log(requestUrl);
    const response = await fetch(requestUrl);
    if (!response.ok) {
      throw new Error(`Error requesting VC: ${response.statusText}`);
    }
    const data = await response.text(); // Parse response as text
    return data;
  } catch (error) {
    // console.error('Error requesting VC:', error);
    return null;
  }
}

// `components/utils/vc_operations.tsx`

export async function checkExistingVC(user: any, pb: any, issuerName: string) {
  try {
    const existingVC = await pb.collection('customer_vc').getFirstListItem(`user="${user.id}" && issuer.name="${issuerName}"`);
    return existingVC.vc;
  } catch (error) {
    // console.error('Error checking existing VC:', error);
    return null;
  }
}

export async function storeCustomerVC(user: any, pb: any, vc: string, name: string, purpose: string, issuerId: string) {
  if (!user || !pb) {
    throw new Error('User not logged in or PocketBase not initialized');
  }

  try {
    const response = await pb.collection('customer_vc').create({
      user: user.id,
      vc: vc,
      name: name,
      purpose: purpose,
      issuer: issuerId,
    });
    return response;
  } catch (error) {
    // console.error('Error storing customer VC:', error);
    return null;
  }
}