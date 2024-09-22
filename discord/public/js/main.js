

fetch('https://portalapi.fanoia.live/api/tickets/getMessages', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
}).then(response => response.json())
    .then(data => {
        console.log(data)
    })