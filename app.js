var express     = require('express'),
    app         = express(),
    mongoose    = require('mongoose'),
    search      = require('google-images'),
    Search      = require('./models/search'),
    History     = require('./models/history');
    
    


mongoose.connect(process.env.DATABASEURL,{useMongoClient: true});
const client = new search(process.env.SEARCHID, process.env.APIKEY);    
mongoose.Promise = global.Promise;
app.set('view engine', 'ejs');
var searchResults = [];

app.get('/', function(req,res){
    res.render('index');
});

app.get('/history',function(req,res){
    resetHistory();
    History.find({},function(err,hist){
        if(err) throw err;
        var histList = [];
        for(var i=0; i<hist.length; i++){
            histList.push(
                {
                    'term':hist[i].term,
                    'when':hist[i].when
            });
        }
        res.json(histList);
    });
});

app.get('/search/:query', function(req,res){
    var page = req.query.offset ? req.query.offset : 1;
    resetHistory();
    var historydb = new History({
        term: req.params.query,
        when: new Date().toString()
    });
    historydb.save(function(err){
        if(err) throw err;
    });
    
    client.search(req.params.query,{page: page}).then(function(urls){
        resetDBS();
    for(var i=0; i<urls.length;i++){
            var newSearch = new Search({
                url: urls[i].url,
                snippet: urls[i].description,
                thumbnail: urls[i].thumbnail.url,
                context: urls[i].parentPage
            });
            newSearch.save(function(err){
                if(err) throw err;

            });
            searchResults.push(newSearch);
                        // console.log('saved ' + newSearch._id)
    }
        var data=[];
        for(var i=0; i<searchResults.length;i++){
            data.push(
                {
                    'url':searchResults[i].url,
                    'snippet':searchResults[i].snippet,
                    'thumbnail':searchResults[i].thumbnail,
                    'context':searchResults[i].context
                })
        }
        res.send(data);
    });
});

function resetDBS(){
            Search.find({}, function(err,srch){
            if(err) throw err;
            if(srch.length > 0){
                Search.remove({},function(err){
                    if(err) throw err;
                });
            }
        });
}
function resetHistory(){
    History.find({}, function(err,hist){
        if(err) throw err;
        if(hist.length>20){
            History.remove({},function(err){
                if(err) throw err;
            });
        }
    });
}


app.listen(process.env.PORT);




