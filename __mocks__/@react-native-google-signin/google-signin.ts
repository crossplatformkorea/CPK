export default {
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
  GoogleSigninButton: {
    Color: {
      Dark: jest.mock,
    },
  },
  statusCodes: {
    SIGN_IN_CANCELLED: jest.mock,
    IN_PROGRESS: jest.mock,
    PLAY_SERVICES_NOT_AVAILABLE: jest.mock,
  },
};
