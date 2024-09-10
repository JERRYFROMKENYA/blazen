import React, { useState } from 'react';
import { Menu, Button, Text } from 'react-native-paper';

type PayinMethod = {
  requiredPaymentDetails: {
    title: string;
  };
};

type PayinMethodMenuProps = {
  payinMethods: PayinMethod[];
  onSelect: (method: PayinMethod) => void;
  selectedPayinMethod?: PayinMethod;
};

const PayinMethodMenu: React.FC<PayinMethodMenuProps> = ({ payinMethods, onSelect, selectedPayinMethod }) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  if (!payinMethods || payinMethods.length === 0) {
    return null; // Return null if payinMethods is undefined or empty
  }

  return (
    selectedPayinMethod ? (
      <Text variant="bodyMedium">{selectedPayinMethod.requiredPaymentDetails.title}</Text>
    ) : (
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Button onPress={openMenu}>Select Payin Method</Button>}
      >
        {payinMethods.map((method, index) => (
          <Menu.Item
            key={index}
            onPress={() => {
              onSelect(method);
              closeMenu();
            }}
            title={method.requiredPaymentDetails.title}
          />
        ))}
      </Menu>
    )
  );
};

export default PayinMethodMenu;