import React, { useState } from 'react';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import {Modal} from "@/components/Themed"

interface PayinMethodMenuProps {
    payinMethods: Array<{ requiredPaymentDetails: { title: string } }>;
    onSelect: (method: { requiredPaymentDetails: { title: string } }) => void;
    selectedPayinMethod?: { requiredPaymentDetails: { title: string } };
}

const PayinMethodMenu: React.FC<PayinMethodMenuProps> = ({ payinMethods, onSelect, selectedPayinMethod }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    const handlePayInMethodSelect = (method: { requiredPaymentDetails: { title: string } }) => {
        onSelect(method);
        closeModal();
    };

    const renderPayInMethodItem = ({ item }: { item: { requiredPaymentDetails: { title: string } } }) => (
        <TouchableOpacity onPress={() => handlePayInMethodSelect(item)}>
            <Text style={styles.modalItem}>{item.requiredPaymentDetails.title}</Text>
        </TouchableOpacity>
    );

    if (!payinMethods || payinMethods.length === 0) {
        return null; // Return null if payinMethods is undefined or empty
    }

    return (
        <>
            {selectedPayinMethod ? (
                <Text variant="bodyMedium">{selectedPayinMethod.requiredPaymentDetails.title}</Text>
            ) : (
                <Button onPress={openModal}>Select Payment Method</Button>
            )}
            <Modal visible={modalVisible} onRequestClose={closeModal}>
                <FlatList
                    data={payinMethods}
                    renderItem={renderPayInMethodItem}
                    keyExtractor={(item, index) => index.toString()}
                />
                <Button onPress={closeModal}>Close</Button>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    modalItem: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default PayinMethodMenu;