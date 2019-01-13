// Initialize Firebase
var config = {
    apiKey: "AIzaSyCg5uoadItFeoGaziXjjaiLzTy-YaVTaVs",
    databaseURL: "https://traintime-19e79.firebaseio.com"
};

firebase.initializeApp(config);

var db = firebase.database();
var nextArrival,
    minutesAway;

// Listeners ************************************************************

$('#submit-train').on("click", function(event) {
    event.preventDefault();

    var isValid = validateForm();
    if (!isValid) { return false; };

    var train = $('#train').val().trim();
    var destination = $('#destination').val().trim();
    var frequency = $('#frequency').val().trim();
    var time = $('#time').val().trim();

    db.ref().push({
        train: train,
        destination: destination,
        time: time,
        frequency: frequency
    });

    $('#train').val('');
    $('#destination').val('');
    $('#time').val('');
    $('#frequency').val('');
});

db.ref().on("child_added", function(snapshot) {
    var time = snapshot.val().time;
    var freq = snapshot.val().frequency;
    calcTimes(time, freq);

    var newTR = $('<tr>');
    newTR.append('<td>' + snapshot.val().train + '</td>');
    newTR.append('<td>' + snapshot.val().destination + '</td>');
    newTR.append('<td>' + freq + '</td>');
    newTR.append('<td>' + moment(nextArrival).format("hh:mm A") + '</td>');
    newTR.append('<td>' + minutesAway + '</td>');
    $('#train-table').append(newTR)

    sortTable();

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

$('#time').on("keypress", function(event) {
    if (event.keyCode < 48 || event.keyCode > 58) {
        event.preventDefault();
    };
});

$('#frequency').on("keypress", function(event) {
    if (event.keyCode < 48 || event.keyCode > 57) {
        event.preventDefault();
    };
});

//Functions ************************************************************

function calcTimes(time, freq) {
    var now = moment();
    var trainTime = moment(time, "HH:mm").subtract(1, "years");
    var timeDiff = moment().diff(moment(trainTime), "minutes");
    var timeRem = timeDiff % freq;
    minutesAway = freq - timeRem;
    nextArrival = moment().add(minutesAway, "minutes");
};

// sortTable function obtained from https://www.w3schools.com/howto/howto_js_sort_table.asp
function sortTable() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("train-table");
    switching = true;
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /* Loop through all table rows (except the
        first, which contains table headers): */
        for (i = 1; i < (rows.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName("td")[0];
            y = rows[i + 1].getElementsByTagName("td")[0];
            // Check if the two rows should switch place:
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                // If so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
};

function validateForm() {
    var isValid = true;

    if ($('#train').val().trim() === '') {
        isValid = false;
    };

    if ($('#destination').val().trim() === '') {
        isValid = false;
    };

    if ($('#time').val().trim() === '' || (/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/).test($('#time').val().trim()) === false) {
        isValid = false;
    };

    if ($('#frequency').val().trim() === '') {
        isValid = false;
    };

    if (isValid) {
        $('#submit-error').text('');
    } else {
        $('#submit-error').text('Please enter a value for each field and be sure to enter time in the format HH:mm');
    };

    return isValid;
};