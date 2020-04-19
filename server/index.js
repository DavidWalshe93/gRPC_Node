// Created by David Walshe on 19/04/2020

// Created by David Walshe on 18/04/2020

// NPM packages
const grpc = require("grpc");
// Local packages
const greets = require("../proto_build/proto/greet_pb");
const service = require("../proto_build/proto/greet_grpc_pb");
const calc = require("../proto_build/proto/calculator_pb");
const calcService = require("../proto_build/proto/calculator_grpc_pb");


// =====================================================================================================================
/**
 Implements the greet Unary RPC method
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

// =====================================================================================================================
/**
 * Streaming API method implementation.
 *
 * @param call
 * @param callback
 */
const greetManyTimes = (call, callback) => {

    const firstName = call.request.getGreeting().getFirstName();

    // Setup a one second interval to see streaming usage.
    let count = 0, intervalID = setInterval(function () {
        // Setup response
        const greetManyTimesResponse = new greets.GreetManyTimesResponse();
        greetManyTimesResponse.setResult(firstName + " " + count);

        // setup streaming
        call.write(greetManyTimesResponse);
        if (++count > 9) {
            // Stop the interval timer.
            clearInterval(intervalID);

            // We have sent all messages
            call.end();
        }
    }, 1000);
};

// =====================================================================================================================
/**
 * Client Streaming API implementation.
 *
 * @param call
 * @param callback
 */
const longGreet = (call, callback) => {

    // Use call.on to handle status triggers on data that is being sent by the client.
    call.on("data", (request) => {
        const fullName = request.getGreeting().getFirstName() + " " + request.getGreeting().getLastName();

        console.log("Hello " + fullName)
    });

    call.on("error", (error) => {
        console.error(error)
    });

    call.on("end", () => {
        const response = new greets.LongGreetResponse();
        response.setResult("Long Greet Client Streaming");

        callback(null, response);
    })
};

// =====================================================================================================================
/**
 * BiDi Streaming API implementation.
 */
const greetEveryone = async (call, callback) => {
    // Receive Data from client.
    call.on("data", response => {
        const fullName = response.getGreeting().getFirstName() + " " + response.getGreeting().getLastName()

        console.log("Hello " + fullName)
    });

    // Error - stream disconnect, etc.
    call.on("error", (error) => {
        console.log(error)
    });

    // End of stream connection.
    call.on("end", () => {
        console.log("The end")
    });

    // Send responses to client asynchronously.
    for (let i = 0; i < 10; i++) {
        const response = new greets.GreetEveryoneResponse();
        response.setResult("John Murphy");

        call.write(response);

        await sleep(1000);
    }

    call.end();
};

const sleep = async (interval) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), interval)
    });
};

// =====================================================================================================================
const squareRoot = (call, callback) => {
    const number = call.request.getNumber();

    if (number >= 0) {
        // Happy path.
        let numberRoot = Math.sqrt(number);
        let response = new calc.SquareRootResponse();
        response.setNumberRoot(numberRoot);

        callback(null, response)
    } else {
        // Error handling.
        return callback({
            code: grpc.status.INVALID_ARGUMENT,
            message: "Number cannot be negative"
        });
    }
}

// =====================================================================================================================
const main = () => {
    const server = new grpc.Server();

    // Register service and map rpc calls to methods.
    server.addService(service.GreetServiceService, {
        greet: greet,
        greetManyTimes: greetManyTimes,
        longGreet: longGreet,
        greetEveryone: greetEveryone
    });

    server.addService(calcService.CalculatorServiceService, {
        squareRoot: squareRoot
    });

    // Start server.
    server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());
    server.start();

    console.log("Server running on 127.0.0.1:50051")
};

main();