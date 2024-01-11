
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        DOM.elid('fund').addEventListener('click', async() => {
            let funds = DOM.elid('funds').value;
            if (funds != "") {
                contract.fund(funds, (error, result) => {
                    if(error){
                        alert(error);
                        console.log(error);
                    } else if (result.message != null) {
                        alert(result.message);
                    }
                });
            } else {
                handleEmptyField();
            }
        })
        
        DOM.elid('register-airline').addEventListener('click', async() => {
            let address = DOM.elid('airline-address').value;
            let name = DOM.elid('airline-name').value;

            if (address != "" && name != "") {
                contract.registerAirline(address, name, (error, result) => {
                    if(error){
                        alert(error);
                        console.log(error);
                    } else if (result.message != null) {
                        alert(result.message);
                    }
                });
            } else {
                handleEmptyField();
            }
        })

        DOM.elid('vote').addEventListener('click', async() => {
            let airlineAddress = DOM.elid('vote-airline-address').value;

            if (airlineAddress != "") {
                contract.voteAirline(airlineAddress, (error, result) => {
                    if(error){
                        alert(error);
                        console.log(error);
                    } else if (result.message != null) {
                        alert(result.message);
                    }
                });
            } else {
                handleEmptyField();
            }
        })

        DOM.elid('register-flight').addEventListener('click', async() => {
            let flight = DOM.elid('new-flight-number').value;
            let destination = DOM.elid('new-flight-destination').value;

            if (flight != "" && destination != "") {
                contract.registerFlight(flight, destination, (error, result) => {                
                    if(error){
                        alert(error);
                        console.log(error);
                    } else if (result.message != null) {
                        alert(result.message);
                        flightDisplay(result.airlineName, flight, destination, result.timestamp);
                    }
                });
            } else {
                handleEmptyField();
            }
        })

        DOM.elid('purchase-insurance').addEventListener('click', () => {
            let flight = DOM.elid('insurance-flight').value;
            let price = DOM.elid('insurance-price').value;

            if (flight != "" && price != "") {
                contract.buy(flight, price, (error, result) => {
                    if(error){
                        alert(error);
                        console.log(error);
                    } else if (result.message != null) {
                        alert(result.message);
                    }
                });
            } else {
                handleEmptyField();
            }
        })

        DOM.elid('check-credit').addEventListener('click', () => {
            let flight = DOM.elid('claim-insurance-flight').value;
 
            if (flight != "") {
                contract.getCreditToPay(flight, (error, result) => {
                    if(error){
                        let creditDisplay = DOM.elid("credit-ammount");
                        creditDisplay.value = "Error happened while getting your credit";
                    } else if (result.message != null) {
                        let creditDisplay = DOM.elid("credit-ammount");
                        creditDisplay.value = result.message;
                    }
                });
            } else {
                handleEmptyField();
            }
        })

        DOM.elid('claim-credit').addEventListener('click', () => {
            let flight = DOM.elid('claim-insurance-flight').value;

            if (flight != "") {
                contract.pay(flight, (error, result) => {
                    if(error){
                        alert(error);
                    } else if (result.message != null) {
                        let creditDisplay = DOM.elid("credit-ammount");
                        alert(result.message);
                        creditDisplay.value = `Your credit remaining for flight: ${flight} is 0 ETH`;
                    }
                });
            } else {
                handleEmptyField();
            }
        })

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            let airlineAddress = DOM.elid('airline-address-for-oracle-submit').value;

            if (flight != "" && airlineAddress != "") {
                contract.fetchFlightStatus(airlineAddress, flight, (error, result) => {
                    if (!error) {
                        display('', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + getTimeFromTimestamp(result.timestamp)} ]);
                        let newTime = result.timestamp;
                        displaySpinner();
                        setTimeout(() => {
                            contract.viewFlightStatus(airlineAddress, flight, (error, result) => {
                                if (!error) {
                                    alert(`Status Returned: ${returnStatus(result)}`);
                                    changeFlightStatus(flight, result, newTime);
                                }
                            });
                            hideSpinner();
                        }, 2000);
                    } else {
                        alert(error);
                    }
                });
            } else {
                handleEmptyField();
            }
        })
    
    });

    DOM.elid('statusButton').addEventListener('click', async(e) => {
        e.preventDefault();
        let buttonValue = e.target.value;
        const response = await fetch(`http://localhost:3000/api/status/${buttonValue}`);
        const myJson = await response.json();
        console.log(myJson);
        alert("Default Status changed to " + myJson.message);
        display('', 'Default flights status change submited to server.', [ { label: 'Server response: ', value: myJson.message} ]);
    })
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);
}

let flightCount = 0;
function flightDisplay(airlineName, flight, destination, time) {
    var table = DOM.elid("flights-display");
    table.style.display = 'block';

    flightCount++;
    var row = table.insertRow(flightCount);
    row.id = flight;
    
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    
    var date = new Date(+time);
    // Add some text to the new cells:
    cell1.innerHTML = "<b>" + airlineName.toUpperCase() + "</b>";
    cell2.innerHTML = "<b>" + flight + "</b>";
    cell3.innerHTML = destination.toUpperCase();
    cell4.innerHTML = date.getHours()+":"+date.getMinutes();
    cell5.innerHTML = "ON TIME";
    cell5.style="color:green";
}

function displaySpinner() {
    document.getElementById("oracles-spinner").hidden = false;
    document.getElementById("submit-oracle").disabled = true;
}

function hideSpinner() {
    document.getElementById("oracles-spinner").hidden = true;
    document.getElementById("submit-oracle").disabled = false;
}

function returnStatus(status) {
    switch(status) {
        case '10':
            return "ON TIME";
        case '20':
            return "LATE AIRLINE";
        case '30':
            return "LATE WEATHER";
        case '40':
            return "LATE TECHNICAL";
        case '50':
            return "LATE OTHER";
        default:
            return "UNKNOWN";
    }
}

function changeFlightStatus(flight, status, newTime) {
    console.log(status);
    var row = DOM.elid(flight);
    row.deleteCell(4);
    row.deleteCell(3);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    let statusText = "";
    switch(status) {
        case '10':
            statusText = "ON TIME";
            cell4.style="color:white";
            cell5.style="color:green";
            break;
        case '20':
            statusText = "LATE AIRLINE";
            cell4.style="color:red";
            cell5.style="color:red";
            break;
        case '30':
            statusText = "LATE WEATHER";
            cell4.style="color:red";
            cell5.style="color:yellow";
            break;
        case '40':
            statusText = "LATE TECHNICAL";
            cell4.style="color:red";
            cell5.style="color:yellow";
            break;
        case '50':
            statusText = "LATE OTHER";
            cell4.style="color:red";
            cell5.style="color:yellow";
            break;
        default:
            statusText = "UNKNOWN";
            cell4.style="color:white";
            cell5.style="color:white";
            break;
    }

    cell4.innerHTML = getTimeFromTimestamp(newTime);
    cell5.innerHTML = statusText;
}

function getTimeFromTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString("es-ES").slice(0, -3);
}

function handleEmptyField() {
    alert("Fields above this button cannot bet empty");
}







