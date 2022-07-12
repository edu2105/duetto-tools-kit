var form = document.getElementById("mews-form");
var logs_textarea = document.getElementById("mews-logs-content");
var refresh_logs = document.getElementById("refresh-logs-btn");
var seession_id_input = document.getElementById("mews-log-id");
var get_reservations = "https://enifi.stage.duettosystems.com/mews-workaround?";
var get_logs = "https://enifi.stage.duettosystems.com/mews-workaround-logs?";
var session_id = "";
var process_finished = false;
var refresh_content_delayms = 50


function checkProcessFinished(){
    if(process_finished == false) {
        window.setTimeout(checkProcessFinished, 5000);
        if(session_id)
            getLogs(session_id);
    }else{
        alert("Process for session Id <" + session_id + "> finished");
    }
};


function getLogs(sessionId){
    var request_options = {
        method: "GET"
    };

    fetch(get_logs + new URLSearchParams({
        sessionId: sessionId
    }), request_options)
    .then( response => response.text() )
    .then( response => {
        if(response.match('Process Finished') == "Process Finished")
            process_finished = true;
        logs_textarea.value = "";
        setTimeout(function() {
            logs_textarea.value = response;
        }, refresh_content_delayms);
    });
};

form.addEventListener("submit", function(e){
    e.preventDefault();
    
    var start_utc = document.getElementById("mews-start-utc").value;
    var end_utc = document.getElementById("mews-end-utc").value;
    var interval = document.getElementById("mews-interval").value;
    var access_token = document.getElementById("mews-access-token").value;
    var service_id = document.getElementById("mews-service-id").value;

    var date_start = new Date(start_utc);
    var date_end = new Date(end_utc);
    console.log("Start UTC: " + date_start);
    console.log("End UTC: " + date_end);

    if(date_start >= date_end){
        return alert("End Date can not be greater or equal than Start Date");
    };

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
        seession_id_input.value = session_id
        getLogs(session_id);
    });
});

refresh_logs.addEventListener("click", function(e){
    e.preventDefault();
    
    session_id = seession_id_input.value;
    getLogs(session_id);
});

checkProcessFinished();