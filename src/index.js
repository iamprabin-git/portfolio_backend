const { app } = require("./app");
const { port } = require("./config/env");
const { initMongo } = require("./db/mongo");

initMongo()
  .then(() => {
    const maxPortAttempts = 20;
    const startServer = (targetPort, attemptsLeft = maxPortAttempts) => {
      const server = app.listen(targetPort, () => {
        // eslint-disable-next-line no-console
        console.log(`Express backend running at http://localhost:${targetPort} (MongoDB)`);
      });

      server.on("error", (error) => {
        if (error && error.code === "EADDRINUSE" && attemptsLeft > 0) {
          // eslint-disable-next-line no-console
          console.warn(`Port ${targetPort} is in use. Trying ${targetPort + 1}...`);
          startServer(targetPort + 1, attemptsLeft - 1);
          return;
        }
        // eslint-disable-next-line no-console
        console.error("Server failed to listen:", error);
        process.exit(1);
      });
    };

    startServer(port);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend:", error);
    process.exit(1);
  });
