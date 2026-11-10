import { Redirect } from 'expo-router';

/** Any unknown address goes to the start screen. */
export default function NotFound() {
  return <Redirect href="/" />;
}
