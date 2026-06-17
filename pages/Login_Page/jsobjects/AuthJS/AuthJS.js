export default {
  login: async () => {
    const result = await LoginAPI.run();
    if (result) {
      storeValue("user", result);
      navigateTo("Home");
    } else {
      showAlert("Invalid email or password", "error");
    }
  }
}