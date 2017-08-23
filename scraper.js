const fs = require('fs'),
	  path = require('path'),
	  scraperjs = require('scraperjs'),
	  siteURL = 'http://www.shirts4mike.com/',
	  json2csv = require('json2csv');

let shirtURLs = [],
scrapedInfo = [],
today = new Date();

const mkdirSync = function (dirPath) {
	//Create the data directory
  try {
    fs.mkdirSync(dirPath)
  } catch (err) {
    if (err.code !== 'EEXIST'){
    	throw err;
    }
  }
}

mkdirSync(path.resolve('./data'));



/*====================Begin page(s) scrape====================*/
scraperjs.StaticScraper.create(`${siteURL}shirts.php`)
	.scrape(function($) {
		//Populate an array that holds all 8 shirt urls
		return $(".products li a").map(function() {
			 shirtURLs.push(siteURL + $(this).attr("href")); 
		}).get();
	}).catch(function(err){
		if(err){
			//Returns an error if the page is not found!
			console.log(`There’s been a 404 error. Cannot connect to the to ${siteURL}`);
		}
	}) //End catch
	.then(function(news) {
		shirtURLs.forEach((url) => {
			//Scrapes info from each url that was populated to the shirtURLs array
			scraperjs.StaticScraper.create(url)
				.scrape(function($) {
						let img = $("img"),
							priceHolder = $("span").text().trim();
						$("span").remove(); 
						scrapedInfo.push({
							"Title": `${$(".shirt-details h1").text()}`, 
							"Price": priceHolder,
							"URL": url,
							"imageURL": `${siteURL}${img.attr('src')}`, 
							"Time": `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`
						});
				}) //Close second scrape
				.then(function(news, util) {
					if(scrapedInfo.length === 8){
						///Checks to see if the scrapedInfo has scraped through shirt URL
						let fields = ['Title', 'Price', 'URL', 'imageURL', "Time"], //Headers for the csv file
						csv = json2csv({data: scrapedInfo, fields: fields}); //Creates csv file

						return fs.writeFile(`data/${today.getUTCFullYear()}-${today.getMonth()+1}-${today.getDate()}.csv`, csv, function(err) {
						  if (err) throw err;
						  console.log('file saved'); //Shows file has successfully been saved
						});
					} //End if
			}); //End inner then
		}); //End forEach
	});//End outter then
