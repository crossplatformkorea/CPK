import {Platform} from 'react-native';
import WebView from 'react-native-webview';
// @ts-ignore
import WebWebView from 'react-native-web-webview';

export default Platform.select({
  default: WebView,
  web: WebWebView,
});
