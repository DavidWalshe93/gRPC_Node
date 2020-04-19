// Created by David Walshe on 19/04/2020

// NPM packages
const grpc = require("grpc");
// Local packages
const calculation = require("../proto/calculator_pb");
const service = require("../proto/calculator_grpc_pb");

const PORT = "127.0.0.1:50050";

const calculate = (req, res) => {
    // Reference body of request
    const body = req.request;

    // Create response object.
    const calc = new calculation.CalculationResponse();

    // Create local vars for ease-of-use.
    var result = 0;
    var number1 = body.getData().getNumber1();
    var number2 = body.getData().getNumber2();
    var operator = body.getData().getOperation();

    // Do simple math calculations.
    switch (operator) {
        case "-":
            result = number1 - number2;
            break;
        case "*":
            result = number1 * number2;
            break;
        case "/":
            if( number2 === 0) {
                result = 1;
            } else {
                result = number1 / number2;
            }
            break;
        case "+":
            result = number1 + number2;
            break;
        default:
            console.log("Cannot calculate result")
    }

    // Save result to response
    calc.setResult(result);

    // Return result to caller
    res(null, calc);
};

const main = () => {
    const server = new grpc.Server();

    server.addService(service.CalculationServiceService, {calculate: calculate});

    server.bind("127.0.0.1:50050", grpc.ServerCredentials.createInsecure());
    server.start();

    console.log("Calculator server running on ", PORT)
};

main();