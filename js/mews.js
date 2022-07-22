let form = document.getElementById("mews-form");
let logs_textarea = document.getElementById("mews-logs-content");
let refresh_logs = document.getElementById("refresh-logs-btn");
let id_input = document.getElementById("mews-log-id");
let download_logs = document.getElementById("download-logs-btn");
let log_label = document.getElementById("selected-log-label");
let radio_logs_type = document.getElementsByName("logs-type-radio");
let get_reservations = "http://localhost:8081/mews-workaround-reservations?";
let get_logs = "http://localhost:8081/mews-workaround-logs?";
let session_id = "";
let access_token_logs = "";
let process_finished = new Number();
let refresh_content_delayms = 50;
const INVALID_DATES = 1;
const INVALID_INTERVAL = 2;
const SUCCESS = 0;
const PROCESS_ONGOING = 10;
const PROCESS_FINISHED_SUCCESS = 20;
const PROCESS_FINISHED_FAILED = 30;
const BY_SESSIONID = "Session Id";
const BY_ACCESSTOKEN = "Access Token";
const RADIO_RESERVATION = 0;
const RADIO_RESPONSE = 1;
const LOG_RESERVATION = "GetReservations";
const LOG_RESPONSE = "GetResponses";

function reset(){
    id_input.value = "";
    logs_textarea.value = "";
    session_id = "";
    process_finished = PROCESS_ONGOING;
    download_logs.disabled = true;
    download_logs.classList.add('btn-disabled');
    log_label.value = BY_SESSIONID;
    radio_logs_type[RADIO_RESERVATION].checked = true;
    radio_logs_type[RADIO_RESPONSE].checked = false;
    for(radio in radio_logs_type){
        radio_logs_type[radio].onclick = function(){
            if(this.value == "log-reservation"){
                log_label.innerHTML = BY_SESSIONID;
                id_input.value = session_id;
            }else if(this.value == "log-response"){
                log_label.innerHTML = BY_ACCESSTOKEN;
                id_input.value = access_token_logs;
            };
        };
    };
};

function checkProcessFinished(){
    if(process_finished == PROCESS_ONGOING) {
        window.setTimeout(checkProcessFinished, 3000);
        if(session_id)
            getLogs(session_id, LOG_RESERVATION);
    }else if(process_finished == PROCESS_FINISHED_SUCCESS){
        Swal.fire({
            icon: "success",
            title: "Finish",
            html: "Process for session id <b><"+
            session_id +
            "></b> finished.",
            confirmButtonText: "Close"
        })
    }else{
        Swal.fire({
            icon: "error",
            title: "Finish",
            html: "Process for session id <b><"+
            session_id +
            "></b> failed.",
            confirmButtonText: "Close"
        })
    };
};

function dateValidation(startDate, endDate, minutesInterval){
    startDateMs = startDate.getTime();
    endDateMs = endDate.getTime();
    minutesIntervalMs = minutesInterval * 60 * 1000;
    numberOfRequest = (endDateMs - startDateMs) / minutesIntervalMs;
    if(startDate >= endDate){
        return INVALID_DATES;
    }else if(numberOfRequest>0 && numberOfRequest<1){
        return INVALID_INTERVAL;
    }else{
        return SUCCESS;
    }
};

function getLogs(id, radio){
    let request_options = {
        method: "GET"
    };

    fetch(get_logs + new URLSearchParams({
        id: id,
        type: radio
    }), request_options)
    .then( response => response.text() )
    .then( response => {
        let regex = '\\[FINISH]';
        let result = response.match(regex);
        if(result == "[FINISH]"){
            if(response.match('- ERROR -') == "- ERROR -"){
                process_finished = PROCESS_FINISHED_FAILED;
            }else{
                process_finished = PROCESS_FINISHED_SUCCESS;
            }
            download_logs.disabled = false;
            download_logs.classList.remove('btn-disabled');
        }
        logs_textarea.value = "";
        setTimeout(function() {
            logs_textarea.value = response;
        }, refresh_content_delayms);
    });
};

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

form.addEventListener("submit", function(e){
    e.preventDefault();
    reset();
    
    let start_utc = document.getElementById("mews-start-utc").value;
    let end_utc = document.getElementById("mews-end-utc").value;
    let interval = document.getElementById("mews-interval").value;
    let access_token = document.getElementById("mews-access-token").value;
    let service_id = document.getElementById("mews-service-id").value;

    let date_start = new Date(start_utc);
    let date_end = new Date(end_utc);
    let validation = dateValidation(date_start, date_end, interval);

    if(validation == INVALID_DATES){
        return ( 
            Swal.fire({
                icon: 'error',
                title: 'Input Error',
                html:
                '<b>Start Date</b> ' +
                'can not be greater or equal than ' +
                '<b>End Date</b>',
                confirmButtonText: "Close"
            })
        );
    }else if(validation == INVALID_INTERVAL){
        return ( 
            Swal.fire({
                icon: 'error',
                title: 'Input Error',
                html:
                '<b>Interval time</b> ' +
                'can not be greater than the date range difference.',
                confirmButtonText: "Close"
            })
        );
    };

    let request_options = {
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
        let session_id_array = response.match('(?<=\<).*(?=\>)');
        session_id = session_id_array.at(0);
        id_input.value = session_id;
        Swal.fire({
            icon: "info",
            title: "Start",
            html: "Process started with session id <b><" +
            session_id + 
            "></b>"+
            "</br>"+
            "</br>"+
            "<p><i>You don't need to copy the session id, will still be available in the Logs section.</i></p>",
            confirmButtonText: "Close"
            }
        );
        getLogs(session_id, LOG_RESERVATION);
        checkProcessFinished();
    });
});

refresh_logs.addEventListener("click", function(e){
    e.preventDefault();
    if(radio_logs_type[RADIO_RESERVATION].checked){
        session_id = id_input.value;
        getLogs(session_id, LOG_RESERVATION);
    }else if(radio_logs_type[RADIO_RESPONSE].checked){
        access_token_logs = id_input.value;
        getLogs(access_token_logs, LOG_RESPONSE);
    };
});

download_logs.addEventListener("click", function(e){
    e.preventDefault();
    download(session_id + ".txt", logs_textarea.value);
});

reset();