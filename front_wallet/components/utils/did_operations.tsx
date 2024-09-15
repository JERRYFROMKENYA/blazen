// `components/utils/did_operations.tsx`

import { usePocketBase } from "@/components/Services/Pocketbase";
import { useAuth } from "@/app/(auth)/auth";

const BASE_URL = 'http://138.197.89.72:3000';

export async function fetchJWK() {
  try {
    const response = await fetch(`${BASE_URL}/jwk`);
    if (!response.ok) {
      throw new Error(`Error fetching JWK: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error(error);
    return null;
  }
}

export async function fetchDHT() {
  try {
    const response = await fetch(`${BASE_URL}/dht`);
    if (!response.ok) {
      throw new Error(`Error fetching DHT: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    // console.error(error);
    return null;
  }
}

export async function storeUserDID(user: any, pb: any, did: object, type: string, source :string) {
  if (!user || !pb) {
    throw new Error('User not logged in or PocketBase not initialized');
  }

  try {
    const response = await pb.collection('customer_did').create({
      user: user.id,
      did: did,
      type: type, // Ensure the type field is included
      source: source
    });
    return response;
  } catch (error) {
    // console.error('Error storing user DID:', error);
    return null;
  }
}

export function useDidOperations() {
  const { user } = useAuth();
  const { pb } = usePocketBase();

  const setJWKDid = async () => {
    const did = await fetchJWK();
    if (!did) {
      throw new Error('Error fetching JWK');
    }
    return await storeUserDID(user, pb, did, 'jwk','app_generated');
  };

  const setDHTDid = async () => {
    const did = await fetchDHT();
    if (!did) {
      throw new Error('Error fetching DHT');
    }
    return await storeUserDID(user, pb, did, 'dht','app_generated');
  };

  return {
    fetchJWK,
    fetchDHT,
    setJWKDid,
    setDHTDid,
  };
}