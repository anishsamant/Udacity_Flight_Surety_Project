
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

            contract.fund(funds, (error, result) => {
                if(error){
                    alert(error);
                    console.log(error);
                } else if (result.message != null) {
                    alert(result.message);
                }
            });
        })
        
        DOM.elid('register-airline').addEventListener('click', async() => {
            let address = DOM.elid('airline-address').value;
            let name = DOM.elid('airline-name').value;

            contract.registerAirline(address, name, (error, result) => {
                if(error){
                    alert(error);
                    console.log(error);
                } else if (result.message != null) {
                    alert(result.message);
                }
            });
        })

        DOM.elid('vote').addEventListener('click', async() => {
            let airlineAddress = DOM.elid('vote-airline-address').value;
            // Write transaction
            contract.voteAirline(airlineAddress, (error, result) => {
                if(error){
                    alert(error);
                    console.log(error);
                } else if (result.message != null) {
                    alert(result.message);
                }
            });
        })

        DOM.elid('register-flight').addEventListener('click', async() => {
            let flight = DOM.elid('new-flight-number').value;
            let destination = DOM.elid('new-flight-destination').value;
            
            // Write transaction
            contract.registerFlight(flight, destination, (error, result) => {                
                if(error){
                    alert(error);
                    console.log(error);
                } else if (result.message != null) {
                    alert(result.message);
                    flightDisplay(result.airlineName, flight, destination, result.timestamp);
                }
            });
        })

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    
    });
    

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








