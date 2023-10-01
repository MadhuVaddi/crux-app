const axios = require("axios");
const GOOGLE_API_KEY = "<YOUR KEY>"

function getData(url) {
  return new Promise((resolve, reject) => {
    let data = JSON.stringify({
      origin: url,
      formFactor: "DESKTOP",
      metrics: [
        "cumulative_layout_shift",
        "first_contentful_paint",
        "first_input_delay",
        "interaction_to_next_paint",
        "largest_contentful_paint",
        "experimental_time_to_first_byte",
      ],
    });
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=" + GOOGLE_API_KEY,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    return axios.request(config)
    .then(function (response) {
      resolve(response.data);
    })
    .catch(function (error) {
      reject(error);
    });
  })
}
export default async function handler(req, res) {
  let promises = []
  JSON.parse(req.body).search.split(",").forEach(async url => {
    promises.push(getData(url))
  })
  
  try {
    let response = await Promise.all(promises)
    res.status(200).json(response);
  } catch (err) {
    console.log(err.message);
    res.status(400).json(err.message);
  }
}
