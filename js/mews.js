let form = document.getElementById("mews-form");
let logs_textarea = document.getElementById("mews-logs-content");
let refresh_logs = document.getElementById("refresh-logs-btn");
let session_id_input = document.getElementById("mews-log-id");
let download_logs = document.getElementById("download-logs-btn");
let get_reservations = "https://enifi.stage.duettosystems.com/mews-workaround-reservations?";
let get_logs = "https://enifi.stage.duettosystems.com/mews-workaround-logs?";
let session_id = "";
let process_finished = false;
let refresh_content_delayms = 50

function reset(){
    session_id_input.value = "";
    logs_textarea.value = "";
    session_id = "";
    process_finished = false;
    download_logs.disabled = true;
    download_logs.classList.add('btn-disabled');
};

function checkProcessFinished(){
    if(process_finished == false) {
        window.setTimeout(checkProcessFinished, 3000);
        if(session_id)
            getLogs(session_id);
    }else{
        Swal.fire({
            icon: "success",
            title: "Finish",
            html: "Process for session id <b><"+
            session_id +
            "></b> finished.",
            confirmButtonText: "Close"
        })
    }
};


function getLogs(sessionId){
    let request_options = {
        method: "GET"
    };

    fetch(get_logs + new URLSearchParams({
        sessionId: sessionId
    }), request_options)
    .then( response => response.text() )
    .then( response => {
        if(response.match('Process Finished') == "Process Finished"){
            process_finished = true;
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
    process_finished = false;

    if(date_start >= date_end){
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
        session_id_input.value = session_id;
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
        getLogs(session_id);
        checkProcessFinished();
    });
});

refresh_logs.addEventListener("click", function(e){
    e.preventDefault();
    
    session_id = session_id_input.value;
    getLogs(session_id);
});

download_logs.addEventListener("click", function(e){
    e.preventDefault();
    download(session_id + ".txt", logs_textarea.value);
})