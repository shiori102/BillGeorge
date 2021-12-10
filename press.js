
//STEP 1 - MAKES SURE JQUERY IS WORKING
$ = jQuery;

//STEP 2 - PASTE NMCSCRAPER FUNCTION
function NmcScraper() {

    let _this = this;
    this.rateLimit = 1000;
    this.limit = 999999;
    this.listingPages = [];
    this.results = [];
    this.pageLimit = 9999;
    this.downloadMode = false
  
    this.finalFunction = () => { 
      _this.downloadMode ? _this.downloadJson(_this.results) : _this.printJson(_this.results); 
    }
  
    this.scrapeListingPages = (selector, func = (_el) => {console.log('no listing processor set.')}, start=0) => {
  
      if (!_this.listingPages.length) {
        console.log('no listing pages found.');
        return;
      }
  
      var current = start;
      var last = (_this.listingPages.length < _this.pageLimit) ? _this.listingPages.length : _this.pageLimit;
      var timeout = _this.rateLimit * 1.6;
      if(start === 0) timeout = 10;
      if(current < last) {
        var pageUrl = _this.listingPages[current];
        setTimeout(() =>{
          $.ajax({
            url: pageUrl,
            success: (res) => {
              var cleanres = res.replace('<head>','<fakehead>').replace('</head>','</fakehead>');
              var $doc = $(cleanres);
              $doc.find(selector).each(function(){
                var $i = $(this);
                _this.results.push(func($i));
              });
              console.log('Found ' + _this.results.length + ' listing items on page ' + (current + 1) + '.');
              
              current++;
              _this.scrapeListingPages(selector,func,current);
            }
          });
        }, timeout);
      }
    }
  
    this.scrapeIndividualPosts = (func = (document, item) => {console.log('no individual processor set.')},start = 0) => {
  
      if (!_this.results.length) {
        console.log('no results loaded; scrape listing pages first.');
        return;
      }
  
      var timeout = 1;
      if(start === 0) timeout = _this.rateLimit * 5;
      // recursive quit check
      setTimeout(() => {
        var current = start;
        var last = (_this.results.length < _this.limit) ? _this.results.length : _this.limit;
        if(current < last) {
          var item = _this.results[current];
          if(item.post_link) {
            setTimeout(() =>{
              $.ajax({
                url: item.post_link,
                success: (res) => {
                  
                  // jquery uses innerhtml which will strip a second head
                  var cleanres = res.replace('<head>','<fakehead>').replace('</head>','</fakehead>').replaceAll('<img','<blockimg');
                  //console.log(cleanres);
                  var $doc = $(cleanres);
  
                  console.log('Requesting item ' + (current + 1) + ' of ' + last + '.');
                  _this.results[current] = func($doc,_this.results[current]);
                  current++;
  
                  _this.scrapeIndividualPosts(func,current);
                }
              });
            }, _this.rateLimit);
          }
        } else {
          _this.finalFunction();
        }
      },timeout);
    }
  
    /**
     * Print functions. One dumps to console and the other downloads the json file
     */
    this.printJson = (obj) => {
      //obj = obj.slice(0,limit);
      if(_this.limit == 1) {
        console.log(obj[0]);
      } else {
        console.log(obj);
      }
    };
  
    // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    this.downloadJson = (obj) => {
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",   dataStr);
      var scrapeString = 'scrape ';
  
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      scrapeString = scrapeString + date+' '+time;
  
      scrapeString = scrapeString + '.json';
  
      downloadAnchorNode.setAttribute("download", scrapeString);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  
  
    /**
     * Handy Helpers
     * things that make it easier to massage data into the format we want
     */
    window.parseDate = (str) => {
      return '@' + (Date.parse(str) / 1000);
    }
    // strip out wordpress sizing
    window.originalImage = (url = '') => {
      var reg = new RegExp(/-\d+[Xx]\d+\./);
      var newurl = url.replace(reg,'.');
      return newurl;
    }
    // strip out styles, classes, etc from elements under $elem
    // returns raw HTML
    this.stripAttributes = ($elem) => {
      $filtered = [];
      Array.from($elem.find('*')).forEach(function(elem) { 
        [...elem.attributes].forEach(attr => {
          if (['class', 'id', 'style'].includes(attr.name)){
            elem.removeAttribute(attr.name);
          } 
        }); 
        $filtered.push(elem.outerHTML);
      });
      return $filtered.join('');
    }
          
  };
  
//STEP 3 - INSTANTIATE OBJECT
  scraper = new NmcScraper();


//STEP 4
var blog = [];
for(var i = 2; i <=57; i++) {
  var str = "https://www.billgeorge.org/blog/page/" + i + "/";
  blog.push(str);
}


//STEP 5
scraper.listingPages = blog;

//OPTIONAL STEP 5
scraper.listingPages.push('https://www.billgeorge.org/blog/');


//STEP 6 - SCRAPE EXCERPTS
// scraper.scrapeListingPages('article.article', (item) => { 
//     var press = {
//       'post_title':$(item).find('h1.article-title').first().text().trim(),
//       //always be post_link
//       'post_link':$(item).find('a.article-title-link').first().attr('href')};

//       var str = $(item).find('p.article-meta').first().text().trim().split('\t\t');
//       var date = str[1];
//       press.post_date = date;
//       return press;
      
    
//   });


  //ONE THAT WORKS
  scraper.scrapeListingPages('article.article', (item) => { 
    var press = {
      'post_title':$(item).find('h1.article-title').first().text().trim(),
      //always be post_link
      'post_link':$(item).find('a.article-title-link').first().attr('href')};
      press.post_category = [];

      Array.from($(item).find('a[rel="category tag"]')).forEach(function(link){ 
        // console.log(link.textContent);
        press.post_category.push(link.textContent)});
       
      var str = $(item).find('p.article-meta').first().text().trim().split('\t\t');
      var date = str[1];
      press.post_date = date;
      return press;
      
    
  });

//kind of works
  // scraper.scrapeListingPages('article.article', (item) => { 
  //   var press = {
  //     'post_title':$(item).find('h1.article-title').first().text().trim(),
  //     //always be post_link
  //     'post_link':$(item).find('a.article-title-link').first().attr('href')};
  //     press.post_category = [];
     

  //     Array.from($(item).find('a[rel="category tag"]')).forEach(function(link){ 
  //       // console.log(link.textContent);
  //       press.post_category.push(link.textContent)});
  //       // console.log(press.post_category);

  //       var arrays = press.post_category;
  //       var result = arrays.map(item => [item]);
  //       press.post_category.push(result);
  //       console.log(result);
        
  //     var str = $(item).find('p.article-meta').first().text().trim().split('\t\t');
  //     var date = str[1];
  //     press.post_date = date;
  //     return press;
    
  // });

 
  for(var i=0, len = pressPosts.length; i < len; i++){
    pressPosts[i]["terms"] = {};
    pressPosts[i].terms['article-categories'] = [];
    pressPosts[i].post_category.forEach(function(item){
      pressPosts[i].terms['article-categories'].push([item])
    })
   
  };

 

  // for(var i=0, len = pressPosts.length; i < len; i++){
  //   pressPosts[i]["terms"] = {};

  //   // pressPosts[i].terms['article-categories'] = [];
  //   pressPosts[i].terms['article-categories'].push([pressPosts[i].post_category]);
 
  // };



  // for(var i=0, len = pressPosts.length; i < len; i++){
  //   pressPosts[i]["terms"] = {};
  //   pressPosts[i].terms['article-categories'] = [];
  //   pressPosts[i].randomArray = [];
  //   pressPosts[i].randomArray.push([pressPosts[i].post_category]);
  //   var arrays = pressPosts[i].randomArray;

  //   arrays[0].forEach(function(item){
  //     var arr = [];
  //     var size = 1;
  //     for (let i = 0; i < item.length; i += size)
  //       arr.push(item.slice(i, i + size));
  //       // console.log(arr);
  //       pressPosts[i].terms['article-categories'].push(arr);
  //   });
  //   console.log(pressPosts[i].terms['article-categories']);
    
  // };


//ONE THAT WORKS
  // for(var i=0, len = pressPosts.length; i < len; i++){
  //   pressPosts[i]["terms"] = {};

  //   pressPosts[i].terms['article-categories'] = [];
  //   pressPosts[i].randomArray = [];
  //   console.log(pressPosts[i].randomArray);
  //   pressPosts[i].randomArray.push([pressPosts[i].post_category]);
  //   var arrays = pressPosts[i].randomArray;
  //   arrays[0].forEach(function(item){
  //     var arr = [];
  //     var size = 1;
  //     for (let i = 0; i < item.length; i += size)
  //       arr.push(item.slice(i, i + size));
  //       console.log(arr);
    
  //   pressPosts[i].terms['article-categories'].push(arr);
    
  //   });

    
  // };




// STEP 7 - SCRAPE INDIVIDUAL POSTS

scraper.scrapeIndividualPosts(($doc, item) => {
  item.post_content = [];
  $doc.find('.article').first();
  $doc.find('.article-title').remove();
  $doc.find('.article-meta').remove();
  $doc.find('.no-break').remove();
  $doc.find('.wp-block-embed__wrapper').remove();
  // var iframe = $doc.find('figure').first();
  // iframe.remove('.disqus_recommendations');
  // iframe.remove('.disqus_thread');
 
  item.post_content.push(scraper.stripAttributes($doc.find('.article')));
       return item;
    });




//STEP 8
copy(JSON.stringify(scraper.results));


  
