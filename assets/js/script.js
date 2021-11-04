//placeholder for API
//https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}

const apiKey = "0765d126b0f6a7eb158764d733ae5823";
var currWeatherDiv = $("#currentWeather");
var forecastDiv = $("#weatherForecast");
var citiesArray;

if (localStorage.getItem("localWeatherSearches")) {
    citiesArray = JSON.parse(localStorage.getItem("localWeatherSearches"));
    writeSearchHistory(citiesArray);
} else {
    citiesArray = [];
};

function returnCurrentWeather(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&APPID=${apiKey}`;

    $.get(queryURL).then(function(response){
        let currTime = new Date(response.dt*1000);
        let weatherIcon = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;

        currWeatherDiv.html(`
        <h2>${response.name}, ${response.sys.country} (${currTime.getMonth()+1}/${currTime.getDate()}/${currTime.getFullYear()})<img src=${weatherIcon} height="70px"></h2>
        <p>Temperature: ${response.main.temp} </p>
        <p>Humidity: ${response.main.humidity} </p>
        <p>Wind Speed: ${response.wind.speed} </p>
        `, returnUVIndex(response.coord))
    })
};

function returnWeatherForecast(cityName) {
    let queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&APPID=${apiKey}`;

    $.get(queryURL).then(function(response){
        let forecastInfo = response.list;
        forecastDiv.empty
        createHistoryButton(response.name);
        $.each(forecastInfo, function(i) {
            if (!forecastInfo[i].dt_txt.includes("12:00:00")) {
                return;
            }

            let forecastDate = new Date(forecastInfo[i].dt*1000);
            let weatherIcon = `https://openweathermap.org/img/wn/${forecastInfo[i].weather[0].icon}.png`;


            forecastDiv.append(`
            <div class="col-md">
                <div class="card text-white bg-primary">
                    <div class="card-body">
                        <h4>${forecastDate.getMonth()+1}/${forecastDate.getDate()}/${forecastDate.getFullYear()}</h4>
                        <img src=${weatherIcon} alt="Icon">
                        <p>Temp: ${forecastInfo[i].main.temp} &#176;C</p>
                        <p>Humidity: ${forecastInfo[i].main.humidity}%</p>
                    </div>
                </div>
            </div>
            `)
        })
    })
};

//function to display UVIndex//
function returnUVIndex(coordinates) {
    let queryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${coordinates.lat}&lon=${coordinates.lon}&APPID=${apiKey}`;

    $.get(queryURL).then(function(response){
        let currUVIndex = response.value;
        let uvSeverity = "green";
        let textColour = "white"
        //Color change based on UV index
        if (currUVIndex >= 11) {
            uvSeverity = "purple";
        } else if (currUVIndex >= 8) {
            uvSeverity = "dark red";
        } else if (currUVIndex >= 6) {
            uvSeverity = "maroon";
            textColour = "black"
        } else if (currUVIndex >= 3) {
            uvSeverity = "sunflower";
            textColour = "black"
        }
        currWeatherDiv.append(`<p>UV Index: <span class="text-${textColour} uvPadding" style="background-color: ${uvSeverity};">${currUVIndex}</span></p>`);
    })
}

function createHistoryButton(cityName) {
    // Check if the button exists in history, and if it does, exit the function
    var citySearch = cityName.trim();
    var buttonCheck = $(`#previousSearch > BUTTON[value='${citySearch}']`);
    if (buttonCheck.length == 1) {
      return;
    }
    
    if (!citiesArray.includes(cityName)){
        citiesArray.push(cityName);
        localStorage.setItem("localWeatherSearches", JSON.stringify(citiesArray);
    }

    $("#previousSearch").prepend(`
    <button class="btn btn-light cityHistoryBtn" value='${cityName}'>${cityName}</button>
    `);
}

function writeSearchHistory(array) {
    $.each(array, function(i) {
        createHistoryButton(array[i]);
    })
}







// Get a deafult weather search
returnCurrentWeather("Berkeley");
returnWeatherForecast("Berkeley");
