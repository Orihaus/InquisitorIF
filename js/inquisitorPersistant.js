var persistentworld = {};
persistentworld.activations = {};
persistentworld.tokens = {};
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
    persistentworld.activations = {};
    persistentworld.store = {};
    persistentworld.time = {};
    persistentworld.entity = {};
    persistentworld.lys = {};
    persistentworld.lys.vialcount = 0;
    persistentworld.lys.currentlys = 50;
    persistentworld.store.currentWorldLocationID = 0;
    persistentworld.store.lastWorldLocationID = 0;
    persistentworld.store.sanity = "sane";
    persistentworld.world = {};
    persistentworld.world.state = "limbo";
    persistentworld.world.linearlocationprogress = 0;
    persistentworld.world.locationvisited = {};
    persistentworld.world.locationcurrentconcept = {};

    persistentworld.time.globaltime = 0;
    persistentworld.time.locationtime = {};
    persistentworld.entity.locations = [];
}

Inquisitor.prototype.loadpersistent = function()
{
    persistentworld.activations = JSON.parse( localStorage.getItem( 'activations' ) );
    persistentworld.tokens = JSON.parse( localStorage.getItem( 'tokens' ) );
    persistentworld.store = JSON.parse( localStorage.getItem( 'store' ) );
    persistentworld.time = JSON.parse( localStorage.getItem( 'time' ) );
    persistentworld.entity = JSON.parse( localStorage.getItem( 'entity' ) );
    persistentworld.lys = JSON.parse( localStorage.getItem( 'lys' ) );
    persistentworld.world = JSON.parse( localStorage.getItem( 'world' ) );

    if ( persistentworld.store === undefined || persistentworld.store === null )
    {
        inquisitor.newsave();
    }
    else if ( persistentworld.store.sanity !== "sane" )
    {
        inquisitor.newsave();
    }
}
