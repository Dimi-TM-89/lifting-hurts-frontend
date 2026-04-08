export const environment = {
  apiUrl: 'http://localhost:8080/api',
  auth0: {
    domain: 'dev-wgwbt3j1uzsgl3mx.us.auth0.com', // e.g. dev-xxxxx.us.auth0.com
    clientId: 'VAw9Vr52R0x7jIOUE3zICk7WQXY3Ev97', // from your App Settings
    audience: 'http://localhost:8080',
    redirectUri: 'http://localhost:4200/callback',
    homeUri: 'http://localhost:4200',
  },
};
