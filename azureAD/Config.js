const CLIENT_ID = '02f47253-560c-477b-994d-fe0692792f86';

const CONFIG = {
    client_id : CLIENT_ID,
    // redirectUrl : 'http://localhost:8080(optional)',
    // authorityHost : 'https://login.microsoftonline.com//oauth2/authorize',
    // tenant  : 'common(optional)',
    // client_secret : 'client-secret-of-your-app(optional)',
    resources : [
      'https://graph.microsoft.com',
      // 'https://outlook.office.com',
      // 'https://outlook.office365.com',
      // 'https://wiadvancetechnology.sharepoint.com',
      // 'https://graph.windows.net',
    ],

    graphURI: 'https://graph.microsoft.com',
    authURL: `https://login.microsoftonline.com/common/oauth2/authorize` + `?client_id=${CLIENT_ID}&response_type=code`,
    logoutURL: 'https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri'
  }

export default CONFIG;