
var date = new Date('October 1, 2021');
var unix = Math.round(date.getTime()/1000);
var string = unix.toString();
var final = "@" + string; 
console.log(final);

//1633060800


for(var i=0, len = press.length; i < len; i++){
    var time = press[i].blog_date;
    var date = new Date(time);
    var unix = Math.round(date.getTime()/1000);
    var string = unix.toString();
    var final = "@" + string; 

    press[i].blog_date = final;
}



for(var i=0, len = videos.length; i < len; i++){
    // videos[i]["custom"] = {};
    // var obj = Object.assign(custom, video_thumb);
    var cloneObj = Object.assign({}, video_thumb);
}


// function renameKey (obj, oldKey, newKey) {
//     obj[newKey] = obj[oldKey];
//     delete obj[oldKey];
// }

// videos.forEach(obj => renameKey(obj, 'video_thumb', 'custom'));
// var updated = JSON.stringify(videos);


// console.log(updated);

for(var i=0, len = videos.length; i < len; i++){
    videos[i]["custom"] = {};
    videos[i]["terms"] = {};


 videos[i].custom.image = videos[i].video_thumb;
 videos[i].terms['media-type'] = [];
 videos[i].terms['media-type'].push([videos[i].video_type])};



videos[i].terms.media_type.push([videos[i].video_type]);




