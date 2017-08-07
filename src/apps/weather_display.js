(() => {
  'use strict';

  let state = {  // Application state controller.
    haveData: false,
    api: {
      apiBaseURL: 'https://api.mesowest.net/v2/',
      service: 'stations/latest',
      // Any valid Latest API argument can be used here.  For this case
      // we are just using three weather stations.  You could use 'network'
      // instead to see a group of stations; i.e. instead of 'stid'
      // use 'network=153'
      parameters: {
        token: 'demotoken',
        stid: '',
        units: 'english',
        vars: 'air_temp,wind_speed,relative_humidity,weather_condition'
      },
      requestURL: ''
    },
  };

  // Application storage container.
  let store = {};

  worker(state.api.service, state.api.parameters);
  setInterval(() => {
    removeElementById('__scroll-items');
    worker(state.api.service, state.api.parameters);
  }, state.tickerRefreshInterval);

  /**
   * Main worker function.
   * Requests data from web service then controls the application update.
   */
  function worker(baseURL, apiParameters) {
    // Fetch data from the Mesonet API.
    getData(baseURL, apiParameters)
      .then((data) => {
        // If successful then create the list items to append to the 'ticker'
        // console.log('data', data)
        addEntryToMarquee(data);
      })
      .catch((error) => console.error('Unexpected error has occurred\n', error);)
  }

  /** Adds data elements to the HTML marquee */
  function addEntryToMarquee(data) {
    let $container = document.getElementById('app-container');
    let $scrollItems = document.createElement('DIV');
    $scrollItems.classList.add('ticker');
    $scrollItems.id = '__scroll-items';
    data.STATION.map((k) => {
      let $item = document.createElement('DIV');
      $item.innerHTML =
          `${k.NAME} ${Math.round(k.OBSERVATIONS.air_temp_value_1.value, 0)}<sup>&deg;</sup>F`;
      $item.classList.add('ticker-item');
      $scrollItems.appendChild($item);
    })
    $container.appendChild($scrollItems);
  }

  /** Removes an element by its id */
  function removeElementById(id) {
    if (document.getElementById(id)) {
      let el = document.getElementById(id);
      return el.parentNode.removeChild(el);
    } else {
      return null;
    }
  }

  /** Fetches data from the Mesonet API */
  function getData(baseURL = '', args = {}) {
    return new Promise((resolve, reject) => {
    state.api.requestURL = state.api.apiBaseURL + baseURL + serializeURLArgs(args);
    fetch(state.api.requestURL)
      .then((response) => { return response.json(); })
      .then((data) => {
        store.data = data;
        state.haveData = true;
        resolve(data);
      })
      .catch((error) => reject(error));
    });
  }

  /** Converts URL parameters to a URI string */
  function serializeURLArgs(obj) {
    let str = ['?'];
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    }
    return str.join('&');
  }
})();