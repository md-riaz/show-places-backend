const axios = require('axios')
const HttpError = require("../models/http-error");

const API_KEY = 'AIzaSyDxYzGibesy-9fQYaSxuJYeFnsm2v573rU';

// async function getCordForAddress(address) {
//      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);
//      const data = response.data;
//
//      if (!data || data.status !== 'ZERO_RESULTS') {
//           throw new HttpError('Could not find location for the specified address.', 422);
//      }
//
//      return data.results[0].geometry.location;
// }

async function getCordForAddress(address){
     return {
          lat: 40.7128,
          lng: -74.0060
     }
}

module.exports = getCordForAddress