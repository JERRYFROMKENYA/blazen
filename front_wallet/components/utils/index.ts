// `components/utils/index.ts`

import { checkExistingVC, storeCustomerVC } from "@/components/utils/vc_operations";

// Get and return VC for the logged-in user
export async function getVCForLoggedInUser(user: any, pb: any) {
  if (!user || !pb) {
    throw new Error('User not logged in or PocketBase not initialized');
  }

  try {
    const existingVC = await checkExistingVC(user, pb, 'Ultimate Identity');
    if(existingVC) return existingVC
  } catch (error) {
    // console.error('Error getting VC for logged-in user:', error);
    return null;
  }
}

// Get and return DID for the logged-in user
export async function getDIDForLoggedInUser(user: any, pb: any) {
  if (!user || !pb) {
    throw new Error('User not logged in or PocketBase not initialized');
  }

  try {
    const didResponse = await pb.collection('customer_did').getFirstListItem(`user="${user.id}" && type="dht"`);
    return didResponse.did;
  } catch (error) {
    // console.error('Error getting DID for logged-in user:', error);

    return "None";
  }
}

// Submit user imported DID from JSON file
export async function submitImportedDID(user: any, pb: any, didJson: any) {
  if (!user || !pb) {
    throw new Error('User not logged in or PocketBase not initialized');
  }

  try {
    const response = await pb.collection('customer_did').create({
      user: user.id,
      did: didJson,
      type: 'imported',
    });
    return response;
  } catch (error) {
    // console.error('Error submitting imported DID:', error);
    return null;
  }
}


export  function codeToCurrency(Code:String){
  return  Code.trim().replace("USDC","USD Coin")
      .replace("GHS","Ghananian Cedis")
      .replace("NGN","Nigerian Naira")
      .replace("KES","Kenyan Shilling")
      .replace("USD","US Dollar")
      .replace("EUR","Euro")
      .replace("GBP","Great Britain Pound")
      .replace("BTC","Bitcoin")
      .replace("GB","Great Britain Pound")
      .replace("MXN","Mexican Peso")
      .replace("AUD","Australian Dollar")

}


export async function updateProfilePicture(user: any, image: any) {
  const pfpForm = new FormData();
  pfpForm.append('profilePicture',
      {
        uri: image.uri,
        type: image.mimeType,
        name: image.fileName
      });
  pfpForm.append('user_id', user.id);

  const response = await fetch('http://138.197.89.72:3000/update-profile-picture', {
    method: 'POST',
    body: pfpForm,
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
      Connection:"keep-alive"
    },
  });
  const res = await response.json()
  console.log(res);

  return !!res.success;

}


export async function  updateIdDocument(user: any, image: []) {
  const pfpForm = new FormData();

  for (let i = 0; i < image.length; i++) {
    pfpForm.append('id_document',
        {
          uri: image[i].uri,
          type: image[i].mimeType,
          name: image[i].fileName
        });
  }

  pfpForm.append('user_id', user.id);

  const response = await fetch('http://138.197.89.72:3000/id-document', {
    method: 'POST',
    body: pfpForm,
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
      Connection:"keep-alive"
    },
  });
  const res = await response.json()
  console.log(res);

  return !!res.success;
}


export async function  uploadFiles(user: any, files: [],description:string,name:string) {
  const pfpForm = new FormData();

  for (let i = 0; i < files.length; i++) {
    pfpForm.append('files',
        {
          uri: files[i].uri,
          type: files[i].mimeType,
          name: files[i].fileName
        });
  }

  pfpForm.append('user_id', user.id);
  pfForm.append('description', description);
  pfForm.append('name', name);


  const response = await fetch('http://138.197.89.72:3000/files', {
    method: 'POST',
    body: pfpForm,
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
      Connection:"keep-alive"
    },
  });
  const res = await response.json()
  console.log(res);

  return res;
}

