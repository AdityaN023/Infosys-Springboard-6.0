export function dateTimeSplit(datetime) {
    datetime = new Date(datetime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata", // IST timezone
        hour12: false
    });

    const dateTimeSplit = datetime.replace(' ', '').split(',');
    return [
        dateTimeSplit[0],
        dateTimeSplit[1].split('.')[0]
    ]
}