import React from 'react';
import { Modal, Text, Button, Portal, Provider } from 'react-native-paper';
import {useDID} from "@/app/DID/did_context";


const DIDModal = () => {
  const { showModal, setShowModal, generateDID } = useDID();

  return (
    <Provider>
      <Portal>
        <Modal visible={showModal} onDismiss={() => setShowModal(false)}>
          <Text>It looks like you don't have a DID. Would you like to generate one?</Text>
          <Button onPress={generateDID}>Generate DID</Button>
          <Button onPress={() => setShowModal(false)}>Cancel</Button>
        </Modal>
      </Portal>
    </Provider>
  );
};

export default DIDModal;