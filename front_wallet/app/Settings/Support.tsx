import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Appbar } from 'react-native-paper';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { useRouter } from "expo-router";

const SupportScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Support" />
      </Appbar.Header>
      <SafeScreen>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.sectionContent}>
              If you have any questions or need support, please contact us at support@example.com.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
            <Text style={styles.sectionContent}>
              Our privacy policy explains how we handle your personal data and protect your privacy when you use our services.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms of Service</Text>
            <Text style={styles.sectionContent}>
              Our terms of service outline the rules and regulations for using our services.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is TBDex</Text>
            <Text style={styles.sectionContent}>
              TBDex is a decentralized exchange platform that allows users to trade cryptocurrencies directly with each other.
            </Text>
          </View>
        </ScrollView>
      </SafeScreen>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
  },
});

export default SupportScreen;