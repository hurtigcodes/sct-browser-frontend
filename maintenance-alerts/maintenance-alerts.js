console.log('MAINT ALERT TEST');

var scheduledAlerts = [];

checkSchedule();
setInterval(() => this.checkSchedule(), 60000);

function checkSchedule() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            calculateSchedule(JSON.parse(this.response)['scheduled_maintenances']);
        }
    };
    xhttp.open("GET", "/status-page/scheduled-maintenances.json", true);
    xhttp.send();
}

function calculateSchedule(schedule) {
    const currentTime = new Date().getTime();

    schedule.forEach(item => {
        if (!this.scheduledAlerts.some(storedItem => storedItem.id === item.id)) {
            if (item.status === 'scheduled') {
                toastr.info(item.incident_updates[0].body, 'NEW MAINTENANCE');
            }
        }

        const scheduledTime = new Date(item.scheduled_for).getTime();

        if (schedule10minCheck(currentTime, scheduledTime)) {
            toastr.warning(item.incident_updates[0].body, item.name);
            toastr.warning(item.incident_updates[0].body, '10 MINS');
        }

        if (schedule5minCheck(currentTime, scheduledTime)) {
            toastr.warning(item.incident_updates[0].body, '5 MINS');
        }

        if (schedule1minCheck(currentTime, scheduledTime)) {
            toastr.warning(item.incident_updates[0].body, '1 MIN');
        }

        this.scheduledAlerts.forEach(storedAlert => {
            if (storedAlert.id === item.id) {
                if (storedAlert.status === 'scheduled' && item.status === 'in_progress') {
                    toastr.info(item.incident_updates[0].body, 'MAINTENANCE STARTED');
                }

                if (storedAlert.status !== 'completed' && item.status === 'completed') {
                    toastr.info(item.incident_updates[0].body, 'MAINTENANCE COMPLETE');
                }
            }
        });
    });

    // this.scheduledAlerts.forEach(storedAlert => {
    //     if (!schedule.forEach(item => item.id === storedAlert.id)) {
    //         this.toastr.info(storedAlert.incident_updates[0].body, 'CANCELLED', this.toastrConfig);
    //     }
    // });

    if (JSON.stringify(schedule) !== JSON.stringify(this.scheduledAlerts)) {
        scheduledAlerts = schedule;
    }
}

function schedule10minCheck(currentTime, scheduledTime) {
    return currentTime > (scheduledTime - 660000) && currentTime < (scheduledTime - 600000);
}

function schedule5minCheck(currentTime, scheduledTime) {
    return currentTime > (scheduledTime - 360000) && currentTime < (scheduledTime - 300000);
}

function schedule1minCheck(currentTime, scheduledTime) {
    return currentTime > (scheduledTime - 120000) && currentTime < (scheduledTime - 60000);
}
