// run getLocation when pages loads... 
//this will also run getWeather with the location of the user...
//obtained from getLocation
window.onload = function () {
  getLocation();
  // searchQuery();  
};

// this gets the location of the user when the page loads
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  console.log(lat + ' :: ' + lon);
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=5290defddab27e09fb2b75fd44ba25f4`;
  getWeather(url);// uses the lat and lon from hte showPosition
}


//this runs the api to the get the weather info
function getWeather(url, timeZone) {
  console.log('urls:', url)
  fetch(url).then(response => {
    if (response.status == 200) {
      console.log('response', response);
      response.json().then(data => {
        console.log('data', data);
        getData(data, timeZone);

      }).catch(ex => {
        console.log(ex);
      });
    }
  }).catch(err => {
    console.log(err);
  });
}

//this gets the api json, parse it and render to the page
const getData = (data, location) => {

  let dat = (data.current.dt) * 1000;
  const dt = new Date(dat);
  console.log(dt);
  let hour = dt.getHours().toString();
  let min = dt.getMinutes().toString();
  let currentTime = `${hour}:${min}`
  const output = `<h5 class="mb-0 ">Current weather @ ${location ? location : data.timezone}</h5>
                      <p class="my-0">as of ${currentTime}</p>
                      <h1 class="my-4">${data.current.temp}</h1>
                      <p class="">${data.current.weather[0].description}</p>
                      <img class="icon float-right" src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png">  
                      `;
  document.querySelector('#main').innerHTML = output;

  const output2 = `<h5 class="mb-0">${location ? location : data.timezone}: Today's Weather</h5>
        <div class="row">
            <div class="col-6">
                <p class="mb-1">Feels like</p>
                <h1 class="mb-2">${data.current.feels_like}</h1>               
            </div>
            <div class="col-6 float-right">
            <img class=" float-right" src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png"> 
            </div>
        </div>
        <div class="row">

            <div class="col-lg-6">
                <div class="detail py-2 border-top">
                    <span><i class="fas fa-poo-storm"></i></span>
                    <span>Pressure</span>
                    <span class="float-right">${data.current.pressure}</span>
                </div>
                <div class="detail py-2 border-top">
                    <span><i class="fas fa-temperature-low"></i></span>
                    <span>Humidity</span>
                    <span class="float-right">${data.current.humidity}</span>
                </div>
                <div class="detail py-2 border-top">
                    <span><i class="fas fa-cloud-rain"></i></span>
                    <span>Dew Point</span>
                    <span class="float-right">${data.current.dew_point}</span>
                </div>
                <div class="detail pt-2 pb-4 border-top">
                    <span><i class="fas fa-bolt"></i></span>
                    <span>Uvi</span>
                    <span class="float-right">${data.current.uvi}</span>
                </div>
            </div>
            <div class="col-lg-6 float-right">                           
                
                <div class="detail py-2 border-top">
                    <span><i class="fas fa-cloud-meatball"></i></span>
                    <span>Clouds</span>
                    <span class="float-right">${data.current.clouds}</span>
                </div>
                <div class="detail py-2 border-top">
                    <span><i class="fas fa-eye-slash"></i></span>
                    <span>Visibility</span>
                    <span class="float-right">${data.current.visibility}</span>
                </div>
                <div class="detail py-2 border-top">
                    <span><i class="fas fa-wind"></i></span>
                    <span>Wind Speed</span>
                    <span class="float-right">${data.current.wind_speed}</span>
                </div>
                <div class="detail pt-2 pb-4 border-top">
                    <span><i class="fas fa-snowflake"></i></span>
                    <span>Wind Degree</span>
                    <span class="float-right">${data.current.wind_deg}</span>
                </div>
            </div>
        </div>`;

  document.querySelector('#feel_like').innerHTML = output2;
}

//this gets the users search for weather of other locations
// and then run getWeather function
const searchQuery = ( timeZone) => {
  console.log(timeZone);
  let lon, lat, location;
  const url2 = `http://api.openweathermap.org/data/2.5/weather?q=${timeZone}&APPID=5290defddab27e09fb2b75fd44ba25f4`;
  fetch(url2).then(response => {
    if (response.status == 200) {
      // console.log('response', response);
      response.json().then(data => {
        location = data.name;
        lon = data.coord.lon;
        lat = data.coord.lat;
        let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=5290defddab27e09fb2b75fd44ba25f4`;
        getWeather(url, location)
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


const submit = document.querySelector('#submit');
const submit2 = document.querySelector('#submit2');


//  listens for click event from the search box
submit.addEventListener('click', function() {
    const search = document.querySelector('#search').value;
    searchQuery( search );
});
submit2.addEventListener('click', function() {
    const search2 = document.querySelector('#search2').value;
    searchQuery( search2 );
});


