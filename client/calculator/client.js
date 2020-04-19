// Created by David Walshe on 19/04/2020

// NPM packages
const grpc = require("grpc");
// Local packages
const calculation = require("../../server/proto/calculator_pb");
const service = require("../../server/proto/calculator_grpc_pb");

const main = () => {

    // Create client
    const client = new service.CalculationServiceClient(
        "localhost:50050",
        grpc.credentials.createInsecure()
    );

    // Create request
    const req = new calculation.CalculationRequest();

    // Create data message.
    const data = new calculation.Data();
    data.setNumber1(10);
    data.setNumber2(2.5);
    data.setOperation("-");

    // Add data to the request.
    req.setData(data);

    // Send the data to the response.
    client.calculate(req, (err, res) => {
        if (!!err === false) {
            console.log("Greeting Response: ", res.getResult());
        } else {
            console.log("Error: ", err);
        }
    })
};

main();