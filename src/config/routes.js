module.exports = {
  routes: {
    /**
     * Main routes
    */
    index: "/", // Get the main index route
    proprietor: "/proprietor", // Get the proprietor route
    profile: "/profile", // Get the profile route
    show: "/:id", // Get the route for a specific ID
    image: "/image/:image", // Get the route for a specific image
    create: "/", // Create a new route
    update: "/:id", // Update the route for a specific ID
    delete: "/:id", // Delete the route for a specific ID
    signup: "/signup", // Get the signup route
    signin: "/signin", // Get the signin route
    signout: "/signout", // Get the signout route
    resetPassword: "/resetPassword", // Get the reset password route

    /**
     * Filter routes
    */
    indexByDate: "/filterByDate", // Get the route for filtering by date
    indexByCity: "/filterByCity/:origin/:destination", // Get the route for filtering by city
    indexByState: "/filterByState", // Get the route for filtering by state
    indexByRequest: "/filterByRequest", // Get the route for filtering by request
    indexByMatch: "/filterByMatch", // Get the route for filtering by match
    indexByAcceptedRequest: "/filterByAcceptedRequest", // Get the route for filtering by accepted request
    indexIsNotPublished: "/filterIsNotPublished", // Get the route for filtering by unpublished items

    /**
     * Package routes
     */
    packageSendSuggestionConfirmation: "/suggestions/confirmation/:package", // Get the route for sending suggestion confirmation
    packageSendRequest: "/requests/:traveler", // Get the route for sending a package request
    packageSendRequestConfirmation: "/requests/confirmation/:package", // Get the route for sending package request confirmation
    packageSendRequestRejection: "/requests/rejection/:package", // Get the route for sending package request rejection
    packageSendCancelation: "/cancelation/:package", // Get the route for sending package cancellation

    /**
     * Travel routes
     */
    travelPublishCancelation: "/cancelation/:travel", // Get the route for publishing travel cancellation

    /**
     * Profile routes
     */
    changeProfileImage: "/profile/image", // Get the route for changing profile image
    changePassword: "/profile/password", // Get the route for changing password

    /**
     * Dashboard routes
     */
    packageDelivered: "/delivered", // Get the route for delivered packages
    packageShipped: "/shipped", // Get the route for shipped packages
    packageReceived: "/received", // Get the route for received packages
    packageCompleted: "/completed", // Get the route for completed packages

    confirmPackageDelivered: "/delivered/:package", // Get the route for confirming package delivery
    confirmPackageShipped: "/shipped/:package", // Get the route for confirming package shipment
    confirmPackageReceived: "/received/:package", // Get the route for confirming package reception
    confirmPackageCompleted: "/completed/:package", // Get the route for confirming package completion
  },
};
