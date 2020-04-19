// Created by David Walshe on 18/04/2020

const grpc = require("grpc");
const greets = require("../server/proto/greet_pb");
const service = require("../server/proto/greet_grpc_pb");

function main() {
    // Create a gRPC client.
    const client = new service.GreetServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    );

    // Create a request
    const req = new greets.GreetRequest();

    // Setup protobuf
    const greeting = new greets.Greeting();
    greeting.setFirstName("John");
    greeting.setLastName("Smith");

    // Load request
    req.setGreeting(greeting);

    client.greet(req, (err, res) => {
        if (!!err === false) {
            console.log("Greeting Response: ", res.getResult());
        } else {
            console.log("Error: ", err);
        }
    })
}


main();