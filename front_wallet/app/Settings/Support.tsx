import React from 'react';
import {StyleSheet, View, ScrollView, Image} from 'react-native';
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
        <Image
            source={require('@/assets/images/adaptive-icon.png')}
            style={{ width: 200, height: 50, marginBottom: 20, alignSelf: "center",marginTop:20 }}
        />
        <Image
            source={require('@/assets/images/tbd_logo.png')}
            style={{ width: 200, height: 50, marginBottom: 20, alignSelf: "center",marginTop:20 }}
        />
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is TBDex</Text>
            <Text style={styles.sectionContent}>
              tbDEX is an open source liquidity and trust protocol that facilitates secure transactions between wallet applications and liquidity providers.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.sectionContent}>
              If you have any questions or need support, please contact us at support@nexx.io.
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
              {`At NexX, we are committed to protecting your privacy and ensuring that your personal information is handled responsibly and securely. This Privacy Policy explains how we collect, use, share, and protect your personal data when you use our services. By accessing or using our application,you agree to the terms outlined in this policy.\n
\n1. Information We Collect
We collect different types of information to improve and offer personalized services. These include:
Personal Information: Information you provide during registration, such as your name, email address, phone number, and other identification details.
Financial Information: Data related to your transactions, wallet balances, and currency exchanges.
Usage Data: Information about how you interact with our app, including IP addresses, browser types, time zone, and activity logs.
Device Information: Data from the device you use, such as hardware model, operating system, and unique device identifiers.\n
\n2. How We Use Your Information
We use the information we collect for various purposes, including:
Providing Services: To manage your account, facilitate transactions, process currency exchanges, and deliver customer support.
Improving User Experience: To understand how you use our services and improve the app's functionality and user experience.
Security and Fraud Prevention: To monitor, detect, and prevent fraudulent activity, unauthorized access, and other security issues.
Communications: To send you notifications, updates, and promotional content, unless you opt out of such communications.
Legal Compliance: To comply with applicable laws, regulations, or legal requests.\n
\n3. Data Sharing and Disclosure
We respect your privacy and will not sell or rent your personal information to third parties. However, we may share your data in the following circumstances:
With Your Consent: When you explicitly agree to share your information with third-party services or partners.
Service Providers: We may share your data with trusted service providers who help us run the app (e.g., cloud storage, analytics, customer service).
Legal Requirements: If required by law or legal process, we may disclose your information to comply with legal obligations or protect our rights.
Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.\n
\n4. Data Security
We take data security seriously and use industry-standard encryption protocols and security measures to protect your personal data from unauthorized access, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
\n5. Data Retention
We retain your personal information only as long as necessary to fulfill the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements.
\n6. Your Rights and Choices
You have control over your personal data, and you can:
Access and Update: Review and update your personal information in your account settings.
Delete Your Data: Request the deletion of your account and personal data. Please note that some data may be retained for legal or regulatory reasons.
Opt-Out of Communications: Unsubscribe from marketing emails or notifications at any time by adjusting your preferences in the app or following the instructions provided in the communication.
Restrict Data Sharing: Limit the data shared with third parties through your app settings.
\n7. Children’s Privacy
Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child under 18 has provided us with personal information, please contact us so we can take appropriate action.
\n8. Changes to This Privacy Policy
We may update this Privacy Policy from time to time to reflect changes in our practices or relevant laws. We will notify you of any significant changes by updating the "Last Updated" date or through in-app notifications.
\n9. Contact Us
If you have any questions about this Privacy Policy or your personal data, please contact us at:
Email: support@nexx.io`}
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
    marginBottom:150
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