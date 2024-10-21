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
  let curr1, curr2;
  if(Code.includes("to")){
    curr1=Code.split("to")[0].trim().replaceAll("USDC","USD Coin")
        .replaceAll("GHS","Ghananian Cedis")
        .replaceAll("NGN","Nigerian Naira")
        .replaceAll("KES","Kenyan Shillings")
        .replaceAll("USD","US Dollars")
        .replaceAll("EUR","Euro")
        .replaceAll("GBP","Great Britain Pounds")
        .replaceAll("BTC","Bitcoin")
        .replaceAll("GB","Great Britain Pounds")
        .replaceAll("MXN","Mexican Pesos")
        .replaceAll("AUD","Australian Dollars")
        .replaceAll("SGD","Singaporean Dollars")
        .replaceAll("HKD","Hong Kong Dollar")
  }else if(Code.includes(":")){
    curr2=Code.split(":")[1].trim().replaceAll("USDC","USD Coin")
        .replaceAll("GHS","Ghananian Cedis")
        .replaceAll("NGN","Nigerian Naira")
        .replaceAll("KES","Kenyan Shillings")
        .replaceAll("USD","US Dollars")
        .replaceAll("EUR","Euro")
        .replaceAll("GBP","Great Britain Pounds")
        .replaceAll("BTC","Bitcoin")
        .replaceAll("GB","Great Britain Pounds")
        .replaceAll("MXN","Mexican Pesos")
        .replaceAll("AUD","Australian Dollars")
        .replaceAll("SGD","Singaporean Dollars")
        .replaceAll("HKD","Hong Kong Dollar")
  }
  const currency =Code.trim().replaceAll("USDC","USD Coin")
      .replaceAll("GHS","Ghananian Cedis")
      .replaceAll("NGN","Nigerian Naira")
      .replaceAll("KES","Kenyan Shillings")
      .replaceAll("USD","US Dollars")
      .replaceAll("EUR","Euro")
      .replaceAll("GBP","Great Britain Pounds")
      .replaceAll("BTC","Bitcoin")
      .replaceAll("GB","Great Britain Pounds")
      .replaceAll("MXN","Mexican Pesos")
      .replaceAll("AUD","Australian Dollars")
      .replaceAll("SGD","Singaporean Dollars")
      .replaceAll("HKD","Hong Kong Dollars")

  const regex = /^(.*) to \1$/; // Matches the same currency code on both sides
  if (regex.test(Code.toString()))  {return (`Send ${curr1} to a NexX User`)}
  return  currency

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


export async function  uploadFiles(user: any, files: File[],description:string,name:string) {
  const pfpForm = new FormData();
  pfpForm.append('user_id', user.id);
  pfpForm.append('description', description);
  pfpForm.append('name', name);
  for (let i = 0; i < files.length; i++) {
    // const blob =new Blob([await files[i].arrayBuffer()])
    pfpForm.append('files',
        files[i],
        files[i].name
        );
    console.log("FILES",files[i])
  }


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
  console.log(res.files);


  return res;
}

