import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/app/(auth)/auth';
import { usePocketBase } from '@/components/Services/Pocketbase';
import {useDidOperations} from '@/components/utils/did_operations';
import {useLoading} from "@/components/utils/LoadingContext";

const DIDContext = createContext();

export const DIDProvider = ({ children }) => {
  const { user } = useAuth();
  const { pb } = usePocketBase();
  const [hasDID, setHasDID] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const {setDHTDid} = useDidOperations();
  const {setLoading}=useLoading()

  useEffect(() => {
    const checkDID = async () => {
      if (user) {
        const userRecord = await pb.collection('customer_did').getFirstListItem(`user="${user.id}"`);
        if (!userRecord.did) {
          setHasDID(false);
          setShowModal(true);
        }
      }
      else{
        setHasDID(false);
        setShowModal(false);
      }
    }
    checkDID();
  }, [user, pb]);

  const generateDID = async () => {
    // Logic to generate DID
    setLoading(true)
    setDHTDid().then(()=>{
      setLoading(false)
    })
    setHasDID(true);
    setShowModal(false);
    setLoading(false)
  };

  return (
    <DIDContext.Provider value={{ hasDID, showModal, setShowModal, generateDID }}>
      {children}
    </DIDContext.Provider>
  );
};

export const useDID = () => useContext(DIDContext);