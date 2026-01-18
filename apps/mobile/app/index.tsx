import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check if user is authenticated
  // If authenticated, redirect to feed
  // If not, redirect to login
  return <Redirect href="/(auth)/login" />;
}
