// Created by David Walshe on 19/04/2020

// Created by David Walshe on 18/04/2020

const grpc = require("grpc");
const greets = require("../proto_build/proto/greet_pb");
const service = require("../proto_build/proto/greet_grpc_pb");

/**
 * Unary API
  */
const callGreetings = () => {
    // Create a gRPC client.
    const client = getClientConnection();
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
};

/**
 * Streaming API
 */
const callGreetManyTimes = () => {
    const client = getClientConnection()

    // create request
    const request = new greets.GreetManyTimesRequest();


    // Setup protobuf
    const data = new greets.Greeting();
    data.setFirstName("Dave");
    data.setLastName("Murphy");

    // Add data to request.
    request.setGreeting(data);

    const call = client.greetManyTimes(request, () => {});

    // Create triggers for stream. These occur on different events over the gRPC Stream API.
    call.on("data", (response) => {
        console.log("Client Streaming Response: ", response.getResult());
    });

    call.on("status", (status) => {
        console.log(status);
    });

    call.on("error", (error) => {
        console.log(error);
    });

    call.on("end", (end) => {
        console.log("Streaming has completed");
    });
};

/**
 * Client Streaming API
 */
const callLongGreeting = () => {
    const client = getClientConnection();

    const request = new greets.LongGreetRequest();

    const call = client.longGreet(request, (error, response) => {
        if (!error) {
            console.log("Server Response: ", response.getResult())
        } else {
            console.log(error)
        }
    });

    // Stream some messages to the server.
    let count = 0, intervalID = setInterval(() => {
        console.log("Sending message " + count);

        // Create a request protobuf message.
        const request = new greets.LongGreetRequest();

        // Create and add data to protobuf message.
        const greeting = new greets.Greeting();
        greeting.setFirstName("John");
        greeting.setLastName("Murphy");

        // Load the greeting data to the request.
        request.setGreeting(greeting);

        // Send the data over the wire.
        call.write(request);

        // Send 3 times and then stop.
        if(++count > 3) {
            clearInterval(intervalID);
            // All messages sent.
            call.end()
        }
    })

};

const callBiDirect = async () => {
    const client = getClientConnection();

    const request = new greets.GreetEveryoneRequest();

    const call = client.greetEveryone(request, (error, response) => {
        console.log("Server Response: " + response)
    });

    call.on("data", (response) => {
        console.log("Hello Client!" + response.getResult());
    });

    call.on("error", (error) => {
        console.log(error)
    });

    call.on("end", () => {
        console.log("The end of the client messages")
    });

    for (let i = 0; i < 10; i++) {
        const greeting = new greets.Greeting();
        greeting.setFirstName("Anne");
        greeting.setLastName("Sweeney");

        const req = new greets.GreetEveryoneRequest();
        req.setGreeting(greeting);

        call.write(req);

        await sleep(1500);
    }
    call.end();
};

const sleep = async (interval) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), interval)
    });
};

const getClientConnection = () => {
    return new service.GreetServiceClient(
        "localhost:50051",
        grpc.credentials.createInsecure()
    )
};

const main = () => {
    // callGreetings()
    // callGreetManyTimes()
    // callLongGreeting();
    callBiDirect();
};


main();