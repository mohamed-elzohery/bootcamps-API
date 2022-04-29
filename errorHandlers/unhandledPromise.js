exports.unhanledPromiseRejetion = (server) => {
    process.on('unhandledRejection', (err, promise) => {
        //Send Feedback to the console
        console.log(`Error: ${err.message}`.red);
        //Close server and exit the process with error
        server.close(process.exit(1));
    })
}