var projectConfig = {
    url: {
      auth: "https://api.also52.hasura-app.io/",
      filestore: "https://filestore.also52.hasura-app.io/v1/file",
      file: "https://api.also52.hasura-app.io/upload"
    }
  }

  const saveOffline = (authToken) => {
    window.localStorage.setItem('authToken', authToken);
  }
  
  const getSavedToken = () => {
    return window.localStorage.getItem('authToken');
  }
  
  module.exports = {
    projectConfig,
    saveOffline,
    getSavedToken
  };
  
