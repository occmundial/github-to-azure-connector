import fetch from 'node-fetch';
// 'qpftyfvsfdog7y5ar54nsmq4n7mwu5am6gshggbjfvzldy7xztva'
// 'Basic QmFzaWM6cXBmdHlmdnNmZG9nN3k1YXI1NG5zbXE0bjdtd3U1YW02Z3NoZ2diamZ2emxkeTd4enR2YQ=='

let pat = 'qpftyfvsfdog7y5ar54nsmq4n7mwu5am6gshggbjfvzldy7xztva';
var server = 'https://dev.azure.com/occmundial/_apis/projects?api-version=2.0';
var headers = {
    'Content-Type': 'application/json; charset=utf-8;',
    'Authorization': 'Basic ' + Buffer.from('Basic'+":"+pat).toString('base64')
};
const options = {
    method: "GET",
    headers: headers
};

console.log(headers);

fetch(server, options)
    //.then(response => response.json())
    .then(response => {
        console.log('Web API responds:');
        console.log(response);
        //console.log(JSON.stringify(response.value[0], null, 4));
    }).catch(error => {
        console.error(error);
    }); 