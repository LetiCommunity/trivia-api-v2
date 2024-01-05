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
    indexByTraveler: "/filterByTraveler",
    indexByMatch: "/filterByMatch",
    indexIsNotPublished: "/filterIsNotPublished",
    packageSendRequest: "/request",
    packageSendConfirmation: "/confirmation/:package",
    //packageSendReject: "/:package",
    changeProfileImage: "/profile/image",
    changePassword: "/profile/password",
  },
};
