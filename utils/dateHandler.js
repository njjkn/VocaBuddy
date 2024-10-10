function getFormattedTimestamp() {
    // Get current date and time in PST timezone
    const date = new Date();
    const options = { timeZone: "America/Los_Angeles", month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const localDate = new Date(date.toLocaleString("en-US", options));
  
    // Formatting the date
    const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(localDate);
  
    // Formatting the time
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const formattedTime = localDate.toLocaleTimeString('en-US', timeOptions);
  
    // Combine date and time
    const formattedTimestamp = `${formattedDate} at ${formattedTime} PST`;
  
    return formattedTimestamp;
}

function parseTimestamp(timestamp) {
    // Extract components from the timestamp string
    const [datePart, timePart] = timestamp.split(' at ');
    const [month, day, year] = datePart.split('/');
    const [time, period, zone] = timePart.split(' ');
  
    // Convert 12-hour to 24-hour time
    let [hour, minute] = time.split(':');
    if (period === "PM" && hour !== "12") {
      hour = (parseInt(hour) + 12).toString();
    } else if (period === "AM" && hour === "12") {
      hour = "00";
    }
    
    // Format as a sortable date-time string: "YYYY-MM-DDTHH:MM:SS"
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}:00`;
}
  
module.exports = {getFormattedTimestamp, parseTimestamp};