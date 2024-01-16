module.exports = {
  routes: {
    // Main routes
    index: "/",
    proprietor: "/proprietor",
    profile: "/profile",
    show: "/:id",
    image: "/image/:image",
    create: "/",
    update: "/:id",
    delete: "/:id",
    signup: "/signup",
    signin: "/signin",
    signout: "/signout",

    // Filter routes
    indexByDate: "/filterByDate",
    indexByCity: "/filterByCity/:origin/:destination",
    indexByState: "/filterByState",
    indexByRequest: "/filterByRequest",
    indexByMatch: "/filterByMatch",
    indexByAcceptedRequest: "/filterByAcceptedRequest",
    indexIsNotPublished: "/filterIsNotPublished",
    packageSendSuggestionConfirmation: "/suggestions/confirmation/:package",
    packageSendRequest: "/requests/:traveler",
    packageSendRequestConfirmation: "/requests/confirmation/:package",
    packageSendRequestRejection: "/requests/rejection/:package",
    packageSendCancelation: "/cancelation/:package",
    travelPublishCancelation: "/cancelation/:travel",
    changeProfileImage: "/profile/image",
    changePassword: "/profile/password",
  },
};
