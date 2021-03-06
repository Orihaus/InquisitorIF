var worldLocation = 'bootstrap.inq';
var world;

var loadsaveerror = false;
var loadsavestatus = 0;

var isusingnwjs = true;
try
{
    if ( require === null || require === undefined )
    {
        isusingnwjs = false;
    }
}
catch (ex)
{
    isusingnwjs = false;
}

if( isusingnwjs )
{
    window.$ = window.jQuery = require('jquery');
    require('./js/include/jquery.smooth-scroll.js');
    require('./js/include/jquery.nicescroll.js');
}

var fps = 60;
function forceRefresh() 
{
    // this function updates the renderer at a given frame rate, even if the user is idle.
    // without this function, the Steam overlay would feel like "frozen".
    setTimeout(function() {
      document.getElementById("forceRefresh").getContext("2d").clearRect(0, 0, 1920, 1080);
      window.requestAnimationFrame(forceRefresh);
    }, 1000 / fps);
  }

function lerp(a, b, n) 
{
    return (1 - n) * a + n * b;
}

//

function resetworld()
{
    clear();
    $( '#core' ).hide();
    inquisitor.initialize( worldLocation, inquisitor.begindisplay );
}

function tryachivement( achivementname )
{
    if( !isusingnwjs )
    {
        return;
    }

    if ( achivementname !== "" )
    {
        console.log( "Steamworks: activating achievement : " + achivementname );
        //greenworks.activateAchievement( achivementname, function () { console.log( "Steamworks: achieved achievement : " + achivementname ); }, function ( err ) { } );
        //greenworks.activateGameOverlay( "achievements" );
    }
}

var greenworks;
var gui;
var nwin;
$( document ).ready( function ()
{
    /*if( isusingnwjs )
    {
        greenworks = require('./greenworks');
        if (greenworks.init())
        {
            console.log('Steam API has been initalized.');
        }
    
        forceRefresh();
    
        gui = require( 'nw.gui' );
        //gui.Window.get().showDevTools();

        nwin = gui.Window.get();
        nwin.enterFullscreen();
    }*/

    clear();
    inquisitor.initialize( worldLocation, inquisitor.begindisplay );
} );

var finaldescriptionsegments = [];
function redraw()
{
    /*$( 'body' ).removeClass( 'fade' );
    setTimeout(
        function () { $( 'body' ).addClass( 'fade' ); }
        , 1 );
    $( 'div' ).removeClass( 'fade' );
    setTimeout(
        function () { $( 'div' ).addClass( 'fade' ); }
        , 1 );

        console.log('inquisitor: redraw');*/

    setTimeout( function () { inquisitor.displayworld(); }, 10 ); //if ( !inquisitor.logic.viewingtimeline ) { inquisitor.toggletimeline();
}

/*var greenworks;
function testSteamAPI()
{
    greenworks = require( './greenworks' );
    if ( greenworks )
    {
        if ( greenworks.initAPI() )
        {
            //greenworks.getNumberOfPlayers( function ( num_of_players ) { $( "#note" ).html( "" + num_of_players ); }, function ( err ) { } );
            console.log( 'Steam API has been initalized.' );
        } else
        {
            console.log( 'Error on initializing Steam API' );
        }
    }
}*/

var mousevelocityvertical = 0, mousevelocityhorizontal = 0;

function tryupdatetime()
{
    var descsegments = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments;
    if ( inquisitor.logic.indialogue )
    {
        //redraw();
        inquisitor.updatedialogue();
    }
    else if ( !persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] && !inquisitor.logic.showingvessels )
    {
        inquisitor.updatetime();

        /*if ( !descsegments[persistentworld.clickthroughprogress[persistentworld.store.currentWorldLocationID]].requiresactivation )
        {
            //persistentworld.clickthroughprogress[persistentworld.store.currentWorldLocationID]++;

            console.log( descsegments );

            //var newnotestring = replacecharacter( descsegments[persistentworld.clickthroughprogress[persistentworld.store.currentWorldLocationID]].text.substring( 1 ), '*', '<emphasis>', '</emphasis>' );
            //crossfadeelement( $( "#notenew" ), 750, 0, newnotestring );
        }*/
    }
}

window.onresize = function(event)
{
    //inquisitor.updatezoom();
    //inquisitor.updatecentering();
};

function clearvessels()
{
    $( "#North" ).html( "" );
    $( "#South" ).html( "" );
    $( "#East" ).html( "" );
    $( "#West" ).html( "" );

    $( "#NorthIndictator" ).hide();
    $( "#SouthIndictator" ).hide();
    $( "#EastIndictator" ).hide();
    $( "#WestIndictator" ).hide();

    $( "#North" ).css( 'border-bottom', "0px solid #333" );
    $( "#South" ).css( 'border-bottom', "0px solid #333" );
    $( "#East" ).css( 'border-bottom', "0px solid #333" );
    $( "#West" ).css( 'border-bottom', "0px solid #333" );

    inquisitor.logic.northvessels = 0;
    inquisitor.logic.southvessels = 0;
    inquisitor.logic.eastvessels  = 0;
    inquisitor.logic.westvessels = 0;

    $( "#vessels" ).html( "" );
    $( "#objects" ).html( "" );

    inquisitor.render.addedlinks = 0;
    inquisitor.render.trueaddedlinks = 0;
}

//$( 'body' ).addClass( 'fade' );
function clear()
{
    //console.log( "inquisitor: clearing" );
    var center = ( $( "#core" ).height() - $( "#div4" ).height() ) / 2;
    //console.log( "inquisitor: Center: " + center );
    //$( "#div4" ).css( { "top": center } );

    $( "#diamond" ).hide();
    $( ".diamondradial" ).hide();
    
    clearvessels();

    inquisitor.logic.timelineeventsadded = 0;
    inquisitor.logic.istransitioning = false;

    $( "#superlocation" ).html( "" );
    $( "#location" ).html( "" );
    $( "#note" ).html( "" );
    $( "#event" ).html( "" );
    $( "#seperator" ).html( "" );
    $( "#region" ).html( "" );
    $( "#subregion" ).html( "" );
    $( "#notenew" ).html( "" );
    $( "#sectionholderrotator" ).html( "" );

    inquisitor.logic.initiatedclearcountdown = false;
    inquisitor.logic.showingvessels = false;
    inquisitor.logic.expanddescription = false;
    inquisitor.logic.currentconceptprogress = 0;
    inquisitor.logic.conceptlinksdisplayed = false;
    inquisitor.logic.conceptsover = false;

    $( "#dialogue" ).hide();
    $( "#dialoguefader1" ).hide();
    $( "#dialoguefader2" ).hide();
    $( "#dialoguedivider1" ).hide();
    $( "#dialoguedivider2" ).hide();

    //$( "#history" ).html( "" );
}
