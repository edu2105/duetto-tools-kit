var form = document.getElementById("mews-form");
var logs_textarea = document.getElementById("mews-logs-content");
var refresh_logs = document.getElementById("refresh-logs-btn");
var get_reservations = "http://localhost:8081/mews-workaround?";
var get_logs = "http://localhost:8081/mews-workaround-logs?";
var session_id = "";

function getLogs(sessionId){
    var request_options = {
        method: "GET"
    };

    fetch(get_logs + new URLSearchParams({
        sessionId: sessionId
    }), request_options)
    .then( response => response.text() )
    .then( response => {
        logs_textarea.value = response;
    });
};


form.addEventListener("submit", function(e){
    e.preventDefault();
    
    var start_utc = document.getElementById("mews-start-utc").value;
    var end_utc = document.getElementById("mews-end-utc").value;
    var interval = document.getElementById("mews-interval").value;
    var access_token = document.getElementById("mews-access-token").value;
    var service_id = document.getElementById("mews-service-id").value;

    var request_options = {
        method: "GET"
    };

    fetch(get_reservations + new URLSearchParams({
        StartUtc: start_utc,
        EndUtc: end_utc,
        MinutesInterval: interval,
        AccessToken: access_token,
        ServiceId: service_id
    }), request_options)
    .then( response => response.text() )
    .then( response => {
        alert(response);
        var session_id_array = response.match('(?<=\<).*(?=\>)');
        session_id = session_id_array.at(0);

        getLogs(session_id);
    });
});

refresh_logs.addEventListener("click", function(e){
    e.preventDefault();
    
    getLogs(session_id);
});