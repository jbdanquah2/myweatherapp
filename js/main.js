// register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('service-worker.js').then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

const api = {
    apikey: '5290defddab27e09fb2b75fd44ba25f4',
    cUrl: 'https://api.openweathermap.org/data/2.5/weather?',
    dUrl: 'https://api.openweathermap.org/data/2.5/onecall?',
    iconUrl: 'https://openweathermap.org/img/wn/'

}

const weatherByName = (timezone) => {
    return `${api.cUrl}q=${timezone}&APPID=${api.apikey}&units=metric`;
}

const weatherByCoord = (lat, lon) => {
    return [`${api.cUrl}lat=${lat}&lon=${lon}&APPID=${api.apikey}&units=metric`,
    `${api.dUrl}lat=${lat}&lon=${lon}&appid=${api.apikey}&units=metric&cnt=8`]
}

// run getLocation when pages loads... 
//this will also run getWeather with the location of the user...
//obtained from getLocation
window.onload = function () {
    init();
    // myFunction(); 
};

const init = () => {
    const data = localStorage.getItem('weatherData') ? JSON.parse(localStorage.getItem('weatherData')) : {};
    const data2 = localStorage.getItem('dailyWeather') ? JSON.parse(localStorage.getItem('dailyWeather')) : {};
    if (data !== {}) { getCurrentData(data) };
    if (data2 !== {}) { getDailyData(data2) };
    console.log('local storage: ', JSON.parse(localStorage.getItem('weatherData')));
    console.log('local storage22: ', JSON.parse(localStorage.getItem('dailyWeather')));
}

//this runs the api to the get the weather info
const getCurrentWeather = (url, timeZone) => {
    console.log('urls:', url)
    fetch(url).then(response => {
        if (response.status == 200) {
            console.log('response', response);
            response.json().then(data => {
                localStorage.setItem('weatherData', JSON.stringify(data))
                console.log('data', data);
                getCurrentData(data, timeZone);

            }).catch(ex => {
                // console.log(ex);
            });
        }
    }).catch(err => {
        console.log(err);
    });
}

const getDailyWeather = (url, timeZone) => {
    console.log('dailyUrl:', url)
    fetch(url).then(response => {
        if (response.status == 200) {
            console.log('response', response);
            response.json().then(data => {
                localStorage.setItem('dailyWeather', JSON.stringify(data))
                console.log('data', data);
                getDailyData(data, timeZone);

            }).catch(ex => {
                console.log(ex);
            });
        }
    }).catch(err => {
        console.log(err);
    });
}

//this gets the api json, parse it and render to the page
const getCurrentData = (data, location) => {
    let [currentTime] = dateBuilder(data.dt);
    const check = data.weather[0].description.indexOf('rain');
    const status = check == -1 ? '<div class="safe">Safe to go out</div>' : '<div class="not-safe">Its Not safe</div>';
    console.log('check: ', check);
    const output = `
    <section class="location">
        <div class="city">${data.name}, ${data.sys.country}</div>
        <div class="date">${currentTime}</div>
    </section>
    <div class="current">
        <div class="temp">${Math.round(data.main.temp)}<span>°c<img alt="weather icon" class="icon" src="${api.iconUrl}${data.weather[0].icon}@2x.png"></span></div>
        <div class="weather">${data.weather[0].description}</div>
        <div class="hi-low">${Math.round(data.main.temp_min)}°c/${Math.round(data.main.temp_max)}°c</div>
        ${status}
    </div>`;

    document.querySelector('#main').innerHTML = output;
}

const getDailyData = (data, location) => {
    let output = `
    <h3 id="dtitle">Daily Weather for the Week</h3>
    <table border="0">
    <thead>
        <th class="align-left">Day</th>
        <th>Weather</th>
        <th>Description</th>
        <th>Temp</th>
        <th>Humidity</th>
        <th>Wind</th>
    </thead>
    <tbody>`;

    for (let i = 1; i < data.daily.length; i++) {
        let [currentTime, day] = dateBuilder(data.daily[i].sunrise);
        output += `<tr>
        <th class="align-left">${day}<br><small>${currentTime.substring(currentTime.indexOf(',') + 1, currentTime.lastIndexOf(','), 1)}</small></th>
        <td class="icon"><small><img  alt="weather icon" class="iconImg" src="${api.iconUrl}${data.daily[i].weather[0].icon}.png"></small></td>
        <td><small>${data.daily[i].weather[0].description}</small></td>
        <td>${Math.round(data.daily[i].temp.min)}°c / ${Math.round(data.daily[i].temp.max)}°c</td>
        <td>${data.daily[i].humidity}%</td>
        <td>${data.daily[i].wind_speed}km/hr</td>
        </tr>`;
    }

    output += `</tbody>
              </table> <br/><br/><br/>`;
    document.querySelector('#dailyWeather').innerHTML = output;
}

const searchQuery = (timeZone) => {
    console.log(timeZone);
    let lon, lat, location;
    const currenUrl = weatherByName(timeZone);
    getCurrentWeather(currenUrl)
    fetch(currenUrl).then(response => {
        if (response.status == 200) {
            // console.log('response', response);
            response.json().then(data => {
                location = data.name;
                lon = data.coord.lon;
                lat = data.coord.lat;
                let [, dailyUrl] = weatherByCoord(lat, lon);
                getDailyWeather(dailyUrl)
                console.log('login::', lon, 'latit::', lat);
            }).catch(ex => {
                console.log(ex);
            });
        } else {
            alert('sorry, location not found. Check the spelling and try again!')
        }
    }).catch(err => {
        console.log(err);
    });
}

const search = document.querySelector('#searchTerm');
search.addEventListener('keypress', function (e) {
    
    const searchTerm = search.value;
    if (searchTerm) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchQuery(searchTerm.trim());
        }
    }
});

const submit = document.querySelector('#submit');
//  listens for click event from the search box
submit.addEventListener('click', function (e) {
    const searchTerm = document.querySelector('#searchTerm').value;
    e.preventDefault();
    if (searchTerm) {    
        searchQuery(searchTerm.trim());
    }
    else alert('Please enter a country, city or town');
});

const dateBuilder = (currentDate) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let dat = (currentDate) * 1000;
    const dateTime = new Date(dat).toLocaleString();
    const dt = new Date(dat);
    console.log(dt);
    let day = days[dt.getDay()];
    let currentTime = `${day}, ${dateTime}`

    return [currentTime, day];
}
