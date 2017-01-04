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

var gui;
if ( isusingnwjs )
{
    require( 'nw.gui' ).Window.get().showDevTools();
    gui = require( 'nw.gui' );
}

//

clear();
inquisitor.initialize( worldLocation, inquisitor.begindisplay );

function resetworld()
{
    clear();
    $( '#core' ).hide();
    inquisitor.initialize( worldLocation, inquisitor.begindisplay );
}

function tryachivement( achivementname )
{
    if ( achivementname !== "" )
    {
        //console.log( "Steamworks: activating achievement : " + achivementname );
        //greenworks.activateAchievement( achivementname, function () { console.log( "Steamworks: achieved achievement : " + achivementname ); }, function ( err ) { } );
        //greenworks.activateGameOverlay( "achievements" );
    }
}

$( document ).ready( function ()
{
    var nwin;
    if( isusingnwjs )
    {
        nwin = gui.Window.get();
        nwin.enterFullscreen();
    }
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

var greenworks;
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
}

//document.addEventListener( 'DOMContentLoaded', function () { testSteamAPI() } );

var fps = 60;
var mousevelocityvertical = 0, mousevelocityhorizontal = 0;
function forceRefresh()
{
    //sigil.initialize( 'canvas' );
    //sigil.draw();

    //mousevelocityhorizontal *= 0.999995;
    //mousevelocityvertical *= 0.999995;

    // this function updates the renderer at a given frame rate, even if the user is idle.
    // without this function, the Steam overlay would feel like "frozen".
    setTimeout( function ()
    {
        document.getElementById( "forceRefresh" ).getContext( "2d" ).clearRect( 0, 0, 1, 1 );
        window.requestAnimationFrame( forceRefresh );
    }, 1000 / fps );
}

function tryupdatetime()
{
    var descsegments = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments;
    if ( inquisitor.logic.indialogue )
    {
        //redraw();
        inquisitor.begindisplay();
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
    //inquisitor.toggletimeline();
    inquisitor.drawcontent();
};

//$( 'body' ).addClass( 'fade' );
function clear()
{
    //console.log( "inquisitor: clearing" );
    var center = ( $( "#core" ).height() - $( "#div4" ).height() ) / 2;
    //console.log( "inquisitor: Center: " + center );
    //$( "#div4" ).css( { "top": center } );

    $( "#diamond" ).hide();
    $( ".diamondradial" ).hide();

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
    inquisitor.logic.timelineeventsadded = 0;
    inquisitor.logic.istransitioning = false;

    $( "#superlocation" ).html( "" );
    $( "#location" ).html( "" );
    $( "#note" ).html( "" );
    $( "#event" ).html( "" );
    $( "#seperator" ).html( "" );
    $( "#vessels" ).html( "" );
    $( "#objects" ).html( "" );
    $( "#region" ).html( "" );
    $( "#subregion" ).html( "" );
    $( "#notenew" ).html( "" );
    $( "#sectionholderrotator" ).html( "" );

    inquisitor.render.addedlinks = 0;
    inquisitor.render.trueaddedlinks = 0;
    inquisitor.logic.initiatedclearcountdown = false;
    inquisitor.logic.currentlocationprogress = 0;
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
