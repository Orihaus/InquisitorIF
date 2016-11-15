var persistentworld = {};
persistentworld.activations = {};
persistentworld.tokens = {};
persistentworld.rulestriggered = {};
persistentworld.store = {};
persistentworld.time = {};
persistentworld.entity = {};
persistentworld.lys = {};
persistentworld.world = {};
persistentworld.world.state = "limbo";
persistentworld.world.linearlocationprogress = 0;
persistentworld.world.locationvisited = {};
persistentworld.world.locationcurrentconcept = {};

Inquisitor.prototype.newsave = function()
{
    persistentworld.tokens = {};
    persistentworld.rulestriggered = {};
    persistentworld.activations = {};
    persistentworld.store = {};
    persistentworld.time = {};
    persistentworld.entity = {};
    persistentworld.lys = {};
    persistentworld.lys.vialcount = 0;
    persistentworld.lys.currentlys = 50;
    persistentworld.store.currentWorldLocationID = 0;
    persistentworld.store.lastWorldLocationID = 0;
    persistentworld.store.title = inquisitor.world.title;
    persistentworld.world = {};
    persistentworld.world.state = "limbo";
    persistentworld.world.linearlocationprogress = 0;
    persistentworld.world.locationvisited = {};
    persistentworld.world.locationcurrentconcept = {};

    persistentworld.time.globaltime = 0;
    persistentworld.time.locationtime = {};
    persistentworld.entity.locations = [];
}

Inquisitor.prototype.savepersistent = function()
{
  localStorage.setItem( inquisitor.world.title + "_activations",    JSON.stringify( persistentworld.activations ) );
  localStorage.setItem( inquisitor.world.title + "_rulestriggered", JSON.stringify( persistentworld.rulestriggered ) );
  localStorage.setItem( inquisitor.world.title + "_tokens",         JSON.stringify( persistentworld.tokens ) );
  localStorage.setItem( inquisitor.world.title + "_store",          JSON.stringify( persistentworld.store ) );
  localStorage.setItem( inquisitor.world.title + "_time",           JSON.stringify( persistentworld.time ) );
  localStorage.setItem( inquisitor.world.title + "_entity",         JSON.stringify( persistentworld.entity ) );
  localStorage.setItem( inquisitor.world.title + "_lys",            JSON.stringify( persistentworld.lys ) );
  localStorage.setItem( inquisitor.world.title + "_world",          JSON.stringify( persistentworld.world ) );
}

Inquisitor.prototype.loadpersistent = function()
{
    persistentworld.activations    = JSON.parse( localStorage.getItem( inquisitor.world.title + '_activations' ) );
    persistentworld.tokens         = JSON.parse( localStorage.getItem( inquisitor.world.title + '_tokens' ) );
    persistentworld.rulestriggered = JSON.parse( localStorage.getItem( inquisitor.world.title + '_rulestriggered' ) );
    persistentworld.store          = JSON.parse( localStorage.getItem( inquisitor.world.title + '_store' ) );
    persistentworld.time           = JSON.parse( localStorage.getItem( inquisitor.world.title + '_time' ) );
    persistentworld.entity         = JSON.parse( localStorage.getItem( inquisitor.world.title + '_entity' ) );
    persistentworld.lys            = JSON.parse( localStorage.getItem( inquisitor.world.title + '_lys' ) );
    persistentworld.world          = JSON.parse( localStorage.getItem( inquisitor.world.title + '_world' ) );

    if ( persistentworld.store === undefined || persistentworld.store === null )
    {
        inquisitor.newsave();
    }
    else if ( persistentworld.store.title !== inquisitor.world.title )
    {
        inquisitor.newsave();
    }
}
