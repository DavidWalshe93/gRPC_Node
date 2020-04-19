// Created by David Walshe on 18/04/2020

// NPM packages
const grpc = require("grpc");
// Local packages
const greets = require("../server/proto/greet_pb");
const service = require("../server/proto/greet_grpc_pb");

/**
 Implements the greet RPC method
 */
const greet = (call, res) => {
    const req = call.request;

    // Create a response object.
    const greeting = new greets.GreetResponse();

    // Build response message
    greeting.setResult(
        "Hello " + req.getGreeting().getFirstName() + " " + req.getGreeting().getLastName()
    );


    // Respond to client
    res(null, greeting)

};


const main = () => {
    const server = new grpc.Server();

    // Register service and map rpc calls to methods.
    server.addService(service.GreetServiceService, {greet: greet});

    // Start server.
    server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());
    server.start();

    console.log("Server running on 127.0.0.1:50051")
};

main();