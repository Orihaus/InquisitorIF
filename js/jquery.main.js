var worldLocation = 'thesilvermasque_world_v0.25.inq';
var world;

var lastlastWorldLocationID = 0;
var lastWorldLocationID = 0;

var persistentworld = {};
var loadsaveerror = false;
var loadsavestatus = 0;
var expanddescription = true;

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

//

clear();
inquisitor.initialize( worldLocation, begindisplay );

function newsave()
{
    persistentworld.tokens = {};
    persistentworld.activations = {};
    persistentworld.store = {};
    persistentworld.time = {};
    persistentworld.entity = {};
    persistentworld.lys = {};
    persistentworld.lys.vialcount = 1;
    persistentworld.lys.currentlys = 10;
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

function resetworld()
{
    clear();
    $( '#core' ).hide();
    inquisitor.initialize( worldLocation, begindisplay );
}

function begingame()
{
    clear();
    $( '#core' ).hide();
    init();
}

var conceptlinksdisplayed = false;
var conceptsover = false;
function displayconceptlinks( concept, descriptionsegments, conceptid )
{
    var conceptlinks = inquisitor.processlinkadditions( concept.id );
    console.log( conceptlinks );

    for ( var index in conceptlinks )
    {
        var newdescriptionsegment = { text: conceptlinks[index].initiatinglink.title, requiresactivation: false, active: true, postactivationtext: '', islink: true }
        newdescriptionsegment.storedlink = conceptlinks[index].initiatinglink;
        newdescriptionsegment.hasstoredlink = true;
        newdescriptionsegment.origin = concept.id;
        newdescriptionsegment.overrideorigin = true;
        newdescriptionsegment.ignorestate = true;
        newdescriptionsegment.conceptuallink = true;
        //newdescriptionsegment.targetconcept = conceptid;
        descriptionsegments.push( newdescriptionsegment );
    }

    conceptlinksdisplayed = true;

    conceptsover = ( conceptlinks.length === 0 );

    return descriptionsegments;
}

var currentlocationprogress = 0, currentconceptprogress = 0;
function updatedescription( additionalsegment )
{
    var descriptionlocation = inquisitor.getlocation( persistentworld.store.currentWorldLocationID );
    var descsegments = descriptionlocation.descriptionsegments;

    //

    if ( descriptionlocation.hasconcepts )
    {
        var currentconcept = inquisitor.getlocation( persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID] );
        console.log( currentconcept );

        if( currentconceptprogress < currentconcept.descriptionsegments.length )
        {
            var conceptdescription = currentconcept.descriptionsegments[currentconceptprogress];
            descsegments.push( conceptdescription );

            currentconceptprogress++;
            //persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID]++;
        }
        else if ( !conceptlinksdisplayed )
        {
            descsegments = displayconceptlinks( currentconcept, descsegments );
            conceptlinksdisplayed = true;
        }
    }
    else
    {
        conceptsover = true;
    }

    //

    if ( additionalsegment !== null && additionalsegment !== undefined )
    {
        console.log( "Inquisitor: Additional segment found : " + additionalsegment.text );
        descsegments.push( additionalsegment );
    }

    if ( descsegments.length === 0 )
    {
        return descsegments;
    }

    $( "#note" ).html( processBodyText( descsegments ) );

    crossfadeelement( $( "#note" ).find( "#" + currentlocationprogress ), 250 + calculatereadingtime( descsegments[descsegments.length - 1].text ) / 20, 0 );

    if ( additionalsegment !== null && additionalsegment !== undefined )
    {
        descsegments.pop();
    }

    return descsegments;
}

function calculatereadingtime( texttoread )
{
    var CPM = 1150.0;
    var characterlength = texttoread.length.toFixed();

    return Math.floor( ( characterlength / CPM ) * 600.0 ) * 100;
}

var timelineeventsadded = 0;

var showingvessels = false;
function updatetime()
{
    currentlocationprogress = persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID]
            ? inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments.length - 1
            : currentlocationprogress;

    //

    persistentworld.time.globaltime++;
    if ( persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID] === undefined || persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID] === null )
    {
        persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID] = 0;
    }
    else
    {
        persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID]++;
    }

    console.log( "Inquisitor: Global time now at : " + persistentworld.time.globaltime + ". Local time now at : " + persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID] );

    inquisitor.updateentities();
    inquisitor.updatetimeline();

    //

    var traverseoncompletion = false;

    console.log( 'inquisitor: state is ' + persistentworld.world.state );
    if ( persistentworld.world.state !== 'stateless' && persistentworld.world.state !== 'linear' )
    {
        persistentworld.lys.currentlys -= 5;
        if ( persistentworld.lys.currentlys < 0 )
        {
            persistentworld.lys.vialcount--;

            if ( persistentworld.lys.vialcount < 0 )
            {
                persistentworld.lys.vialcount = 0;
                traverseoncompletion = true;
            }
            
                persistentworld.lys.currentlys = 100;
        }

        console.log( "Lys state. vialcount: " + persistentworld.lys.vialcount + " lyscount: " + persistentworld.lys.currentlys );

        //$( "#lyscontainer" ).show();
        $( "#lysdiamondouter" ).css( 'border-image', "-webkit-linear-gradient(45deg,rgba(166,148,113,0.3) 0%,rgba(166,148,113,0.9) " + persistentworld.lys.currentlys + "%,rgba(0,0,0,0.8)" + ( persistentworld.lys.currentlys + 2 ) + "%) 1" );

        var vialcountstring = "-";
        switch ( persistentworld.lys.vialcount )
        {
            case 1:
                vialcountstring = 'I';
                break;
            case 2:
                vialcountstring = 'II';
                break;
            case 3:
                vialcountstring = 'III';
                break;
            case 4:
                vialcountstring = 'IV';
                break;
            case 5:
                vialcountstring = 'V';
                break;
        }

        $( "#lyscounter" ).html( vialcountstring );

        $( "#lyscontainer" ).removeClass( "alwaysHide" );
        $( "#lysdiamondouter" ).removeClass( "alwaysHide" );
        $( "#lysdiamond" ).removeClass( "alwaysHide" );
        $( "#lyscounter" ).removeClass( "alwaysHide" );
    }
    else
    {
        $( "#lyscontainer" ).addClass( "alwaysHide" );
        $( "#lysdiamondouter" ).addClass( "alwaysHide" );
        $( "#lysdiamond" ).addClass( "alwaysHide" );
        $( "#lyscounter" ).addClass( "alwaysHide" );
    }

    //

    /*currenteventactive = !currenteventactive;
    console.log( "inquisitor: Event Prompt Clicked." );
    redraw();*/

    var descsegments = updatedescription();

    var loca = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments[currentlocationprogress];
    var locaold = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments[currentlocationprogress - 1];
    var readtime = 1500;
    var previousreadtime = 5000;

    if ( loca != null && loca != undefined )
    {
        //readtime = calculatereadingtime( loca.text );
    }

    if ( locaold != null && locaold != undefined )
    {
        previousreadtime = calculatereadingtime( locaold.text );
    }

    var ourheight = 10000;
    var ourtime = 1500;
    var doshow = persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID];

    if ( inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments.length !== 0 )
    {
        if ( currentlocationprogress < inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments.length - 1 )
        {
            crossfadeelement( $( "#notecontinue" ), 1500, 0, "\n..." );
            $( "#endofnote" ).hide();
            //$( "#diamond" ).hide();
            $( "#note" ).stop();
            $( "#note" ).animate( { scrollTop: ourheight }, ourtime );

            //setTimeout( function () { updatetime(); }, readtime );

            //
        }
        else
        {
            doshow = true;
        }
    }
    else
    {
        doshow = true;
    }

    if ( !doshow )
    {
        var allow = true;
        if ( descsegments[currentlocationprogress].requiresactivation )
        {
            allow = false;
            allow = testactivationrequirements( currentlocationprogress, descsegments );

            if ( descsegments[currentlocationprogress + 1] !== null && descsegments[currentlocationprogress + 1] != undefined )
            {
                if ( descsegments[currentlocationprogress + 1].requiresactivation )
                {
                    allow = true;
                }
            }

            /*if ( persistentworld.activations[persistentworld.store.currentWorldLocationID + ":" + index] )
            {
                allow = true;
            }*/
        }
        //

        if ( allow )
        {
            currentlocationprogress++;
        }
    }

    toggletimeline();

    if ( doshow && conceptsover )
    {
        toggleExpand();
        persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] = true;

        showingvessels = true;
        displayvessels();
        crossfadeelement( $( "#notecontinue" ), 1500, 0, "" );
        $( "#endofnote" ).fadeIn( 500 );

        if ( persistentworld.world.state === 'linear' )
        {
            traverseoncompletion = false;

            var locationtoreturn = persistentworld.store.lastWorldLocationID;
            persistentworld.store.lastWorldLocationID = persistentworld.store.currentWorldLocationID;
            persistentworld.store.currentWorldLocationID = locationtoreturn;

            redraw();
        }
        
        $( "#note" ).stop();
        $( "#note" ).animate( { scrollTop: ourheight }, ourtime );
    }
    else if ( !expanddescription )
    {
        toggleExpand();
    }

    if( traverseoncompletion )
    {
        persistentworld.store.lastWorldLocationID = persistentworld.store.currentWorldLocationID;
        persistentworld.store.currentWorldLocationID = inquisitor.traverselinearlocation();

        redraw();
    }

    var backgroundimageurl = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).backgroundimage;
    if ( backgroundimageurl !== '' )
    {
        $( '#background' ).css( "background-image", "url(img/" + backgroundimageurl + ")" );
        //console.log( backgroundimageurl );
    }
}

function tryachivement( achivementname )
{
    if ( achivementname !== "" )
    {
        console.log( "Steamworks: activating achievement : " + achivementname );
        greenworks.activateAchievement( achivementname, function () { console.log( "Steamworks: achieved achievement : " + achivementname ); }, function ( err ) { } );
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

    persistentworld.activations = JSON.parse( localStorage.getItem( 'activations' ) );
    persistentworld.tokens = JSON.parse( localStorage.getItem( 'tokens' ) );
    persistentworld.store = JSON.parse( localStorage.getItem( 'store' ) );
    persistentworld.time = JSON.parse( localStorage.getItem( 'time' ) );
    persistentworld.entity = JSON.parse( localStorage.getItem( 'entity' ) );
    persistentworld.lys = JSON.parse( localStorage.getItem( 'lys' ) );
    persistentworld.world = JSON.parse( localStorage.getItem( 'world' ) );

    if ( persistentworld.store === undefined || persistentworld.store === null )
    {
        newsave();
    }
    else if ( persistentworld.store.sanity !== "sane" )
    {
        newsave();
    }

    //

    //

    begingame();
} );

var combinationstore = {};
var finaldescriptionsegments = [];
var indialogue = false;
var currenteventactive = false;
var soundmuted = false;

var savedlocation = -1;
var isincredits = false;

function redraw()
{
    $( 'body' ).removeClass( 'fade' );
    setTimeout(
        function () { $( 'body' ).addClass( 'fade' ); }
        , 1 );
    $( 'div' ).removeClass( 'fade' );
    setTimeout(
        function () { $( 'div' ).addClass( 'fade' ); }
        , 1 );

    setTimeout( function () { displayWorld(); if ( !viewingtimeline ) { toggletimeline(); } }, 100 );
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
    /*setTimeout( function ()
    {
        document.getElementById( "forceRefresh" ).getContext( "2d" ).clearRect( 0, 0, 1, 1 );
        window.requestAnimationFrame( forceRefresh );
    }, 1000 / fps );*/
}

var escapekeyheldfor = 0;
var lastmousepagex = 0, lastmousepagey = 0;

function moveBackground( event )
{
    var halfWindowH = $( window ).height() * 2.0,
        halfWindowW = $( window ).width() * 2.0;

    var correctedx = ( event.screenX - halfWindowW ) * ( $( window ).height() / $( window ).width() );
    var correctedy = ( event.screenY - halfWindowH );

    var rotateY = ( ( correctedx - lastmousepagex ) ),
        rotateX = ( ( correctedy - lastmousepagey ) );

    lastmousepagex = correctedx;
    lastmousepagey = correctedy;

    mousevelocityvertical += rotateY * 0.25;
    mousevelocityhorizontal += rotateX * 0.25;

    $( '.background' ).css( {
        '-moz-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        '-webkit-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        '-ms-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        '-o-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        'transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
    } );

    $( '.backgroundoffset' ).css( {
        '-moz-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        '-webkit-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        '-ms-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        '-o-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        'transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
    } );

    $( '.backgroundoffsetdouble' ).css( {
        '-moz-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        '-webkit-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        '-ms-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        '-o-transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
        'transform': 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)',
    } );
}

function tryupdatetime()
{
    var descsegments = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments;
    if ( indialogue )
    {
        redraw();
    }
    else if ( !persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] && !showingvessels )
    {
        updatetime();

        /*if ( !descsegments[persistentworld.clickthroughprogress[persistentworld.store.currentWorldLocationID]].requiresactivation )
        {
            //persistentworld.clickthroughprogress[persistentworld.store.currentWorldLocationID]++;

            console.log( descsegments );

            //var newnotestring = replacecharacter( descsegments[persistentworld.clickthroughprogress[persistentworld.store.currentWorldLocationID]].text.substring( 1 ), '*', '<emphasis>', '</emphasis>' );
            //crossfadeelement( $( "#notenew" ), 750, 0, newnotestring );
        }*/
    }
}

function findcenter( element )
{
    var el = $( element );
    var elOffset = el.offset().top;
    var elHeight = el.height();
    var windowHeight = $( window ).height();
    var offset;

    if ( elHeight < windowHeight )
    {
        offset = elOffset - ( ( windowHeight / 2 ) - ( elHeight / 2 ) );
    }
    else
    {
        offset = elOffset;
    }

    return offset;
}

var viewingtimeline = true;
function toggletimeline()
{
    //viewingtimeline = !viewingtimeline;
    $( '#core' ).show();

    if ( viewingtimeline )
    {
        $.smoothScroll( {
            scrollElement: $( '.content' ),
            offset: findcenter( '#core' ) + 50
        } );
    }
    else
    {
        $.smoothScroll( {
            scrollElement: $( '.content' ),
            offset: findcenter( '#timeline' )
        } );
    }

    //$( "#exitprompt" ).html( "viewingtimeline: " + viewingtimeline );
}

function toggleExpand()
{
    expanddescription = !expanddescription;

    var newmaxheight = expanddescription ? '600px' : '400px';

    $( "#note" ).animate( { 'max-height': newmaxheight }, 700, function () { } );
}

function init()
{
    if ( isusingnwjs )
    {
        testSteamAPI();
    }

    //

    $( document ).on( 'mousemove', function ( event )
    {
        window.requestAnimationFrame( function ()
        {
            moveBackground( event );
        } );
    } );

    //

    var lastKeyUpAt = 0;
    var initiatedexitcountdown = false;
    var initiatedclearcountdown = false;
    $( document ).on( 'keydown', function ( e )
    {
        if ( e.keyCode == 9 )
        {
            viewingtimeline = !viewingtimeline;
            toggletimeline();
        }

        if ( e.keyCode == 68 )
        {
            //gui.Window.get().showDevTools();
            viewingtimeline = !viewingtimeline;
            toggletimeline();
        }

        if ( e.keyCode == 69 )
        {
            toggleExpand();
        }

        if ( e.keyCode == 27 && !initiatedexitcountdown )
        {
            var keyDownAt = new Date();
            initiatedexitcountdown = true;

            //

            $( "#exitprompt" ).html( "Exiting in 3 seconds. \n Release ESC to cancel." );

            setTimeout( function ()
            {
                if ( initiatedexitcountdown )
                {
                    $( "#exitprompt" ).html( "Exiting in 2 seconds. \n Release ESC to cancel." );
                }
            }, 1000 );

            setTimeout( function ()
            {
                if ( initiatedexitcountdown )
                {
                    $( "#exitprompt" ).html( "Exiting in 1 seconds. \n Release ESC to cancel." );
                }
            }, 2000 );

            //

            setTimeout( function ()
            {
                if ( +keyDownAt > +lastKeyUpAt && initiatedexitcountdown )
                {
                    gui.App.quit();
                }
            }, 3000 );
        }

        if ( e.keyCode == 67 && !initiatedclearcountdown )
        {
            var keyDownAt = new Date();
            initiatedclearcountdown = true;

            //

            $( "#clearprompt" ).html( "Clearing in 3 seconds. \n Release C to cancel." );

            setTimeout( function ()
            {
                if ( initiatedclearcountdown )
                {
                    $( "#clearprompt" ).html( "Clearing in 2 seconds. \n Release C to cancel." );
                }
            }, 1000 );

            setTimeout( function ()
            {
                if ( initiatedclearcountdown )
                {
                    $( "#clearprompt" ).html( "Clearing in 1 seconds. \n Release C to cancel." );
                }
            }, 2000 );

            //

            setTimeout( function ()
            {
                if ( +keyDownAt > +lastKeyUpAt && initiatedclearcountdown )
                {
                    $( "#clearprompt" ).html( "" );
                    newsave();
                    redraw();
                }
            }, 3000 );
        }
    });

    $( document ).on( 'keyup', function ( e )
    {
        if ( e.keyCode == 27 && initiatedexitcountdown )
        {
            lastKeyUpAt = new Date();
            initiatedexitcountdown = false;
            $( "#exitprompt" ).html( "" );
        }
    });

    $( "#mutebutton" ).live( "click", function ()
    {
        soundmuted = !soundmuted;
        redraw();
    } );

    $( "#creditsbutton" ).live( "click", function ()
    {
        isincredits = !isincredits;

        if ( isincredits )
        {
            savedlocation = persistentworld.store.currentWorldLocationID;
            persistentworld.store.currentWorldLocationID = inquisitor.world.rawlocations.length - 1;
        }
        else
        {
            persistentworld.store.currentWorldLocationID = savedlocation;
        }

        redraw();
    } );

    $( "#prompttext" ).live( "click", function ()
    {
        currenteventactive = !currenteventactive;
        console.log( "inquisitor: Event Prompt Clicked." );
        redraw();
    } );

    $( "digit" ).live( "click", function ()
    {
        var value = targetLocation = $( this ).text();
        var origin = targetLocation = $( this ).attr( "origin" );
        var index = targetLocation = $( this ).attr( "index" );
        console.log( "inquisitor: Digit Clicked. Current value: " + value + ". From: " + origin + ". Index: " + index );

        combinationstore[origin][index]++;

        if ( combinationstore[origin][index] > 9 )
        {
            combinationstore[origin][index] = 0;
        }

        $( "#objects" ).html( "" );
        processChildren();
    } );

    $( "vessel, inlinelink" ).live( "click", function ()
    {
        targetLocation = $( this ).attr( "data" );

        var token = $( this ).attr( "token" );
        if ( token !== '' && token !== undefined )
        {
            persistentworld.tokens[token.trim()] = persistentworld.store.currentWorldLocationID;
            console.log( "inquisitor: Added " + token );
        }

        var action = $( this ).attr( "action" );
        if ( action !== '' && token !== action )
        {
            if ( action === 'hide' )
            {
                inquisitor.getlocation(persistentworld.store.currentWorldLocationID).hidden = true;
                console.log( "inquisitor: Hidden Object: " + persistentworld.store.currentWorldLocationID );
            }
            if ( action === 'reset' )
            {
                resetworld();
            }
            console.log( "inquisitor: Performed Action: " + action );
        }

        lastlastWorldLocationID = lastWorldLocationID;

        var conceptual = $( this ).attr( "conceptual" );
        if ( conceptual !== null && conceptual !== undefined )
        {
            persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID] = targetLocation;
            currentconceptprogress = 0;
            conceptlinksdisplayed = false;

            //var newtext = processBodyText( inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments );
            //$( "#note" ).html( newtext );

            updatetime();
        }
        else
        {
            persistentworld.store.lastWorldLocationID = persistentworld.store.currentWorldLocationID;
            persistentworld.store.currentWorldLocationID = targetLocation;

            redraw();
        }
    } );

    $( "html" ).live( "click", function ()
    {
        tryupdatetime();
    } );

    /*$( "#note" ).scroll( function ()
    {
        tryupdatetime();
    } );*/

    //

    $( "activenote" ).live( "click", function ()
    {
        var index = $( this ).attr( "index" );
        inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments[index].active = true;
        persistentworld.activations[persistentworld.store.currentWorldLocationID + ":" + index] = true;

        var givetoken = inquisitor.getlocation(persistentworld.store.currentWorldLocationID).descriptionsegments[index].givetoken;
        if ( givetoken !== '' )
        {
            persistentworld.tokens[givetoken] = persistentworld.store.currentWorldLocationID;
            console.log( "inquisitor: Added " + givetoken );

            if ( givetoken === 'FreeRoam' )
            {
                console.log( "inquisitor: Entering Free Roam" );
                persistentworld.tokens["MynometerActivated"] = persistentworld.store.currentWorldLocationID;
                persistentworld.tokens["HasLantern"] = persistentworld.store.currentWorldLocationID;
                persistentworld.tokens["HasHourKey"] = persistentworld.store.currentWorldLocationID;
                persistentworld.tokens["HasMinuteKey"] = persistentworld.store.currentWorldLocationID;
                persistentworld.tokens["HasMoonKey"] = persistentworld.store.currentWorldLocationID;
                persistentworld.tokens["HasSunKey"] = persistentworld.store.currentWorldLocationID;
                persistentworld.tokens["HasPlainKey"] = persistentworld.store.currentWorldLocationID;
                persistentworld.tokens["HasRecordScriabin"] = persistentworld.store.currentWorldLocationID;
                persistentworld.tokens["ForecourtGateOpen"] = persistentworld.store.currentWorldLocationID;
                persistentworld.tokens["VaultOpen"] = persistentworld.store.currentWorldLocationID;
            }

            redraw();
        }
	    
        var newtext = processBodyText( inquisitor.getlocation(persistentworld.store.currentWorldLocationID).descriptionsegments );
        $( "#note" ).html( newtext );
    } );
}

function replacecharacter( text, char, replacementfirst, replacementsecond )
{
    var finaltextsegment = '';

    var starstatus = true, replaceindex = 0, replacedlast = false;
    for ( var i = 0; i < text.length; i++ )
    {
        var segchar = text.charAt( i );

        if ( segchar === char )
        {
            if ( starstatus )
            {
                finaltextsegment += replacementfirst;
            }
            else
            {
                finaltextsegment += replacementsecond;
            }
            starstatus = !starstatus;
            replaceindex++;
            replacedlast = ( i === text.length - 1 );
        }
        else
        {
            finaltextsegment += segchar;
        }
    }

    /*if ( text.charAt( 0 ) === char || text.charAt( text.length - 1 ) === char )
    {
        if ( replaceindex === 1 )
        {
            finaltextsegment = text;
        }

        finaltextsegment = replacementfirst + finaltextsegment;
        finaltextsegment += replacementsecond;
    }*/

    return finaltextsegment;
}

function processdescriptiontext( descriptiontext, removefirst )
{
    var trimmedtext = descriptiontext;

    if ( trimmedtext.charAt( 1 ) === ' ' )
    {
        var storedtext = trimmedtext;

        if ( removefirst )
        {
            //console.log( "Found space after drop cap, removing..." );
            trimmedtext = trimmedtext.charAt( 0 ) + storedtext.substr( 2 );
        }
    }

    var description = "";

    //

    var splitdescriptionQuote = trimmedtext.split( '"' );
    if ( splitdescriptionQuote.length > 0 )
    {
        var first = false;

        for ( var index = 0; index < splitdescriptionQuote.length; index++ )
        {
            if ( first )
            {
                description += '<quote>\u2018';
            }
            else
            {
                if ( description !== "" )
                {
                    description += '\u2019</quote>';
                }
            }
            first = !first;

            description += splitdescriptionQuote[index];
        }
    }

    if ( !removefirst )
    {
        var descfirstchar = description.charAt( 0 );
        description = ( ( descfirstchar === '*' || descfirstchar === '%' ) ? descfirstchar + "<first>" + description.substr( 1 ) : "<first>" + description );

        var splitdescription = description.split( ' ' ); description = '';
        for ( var index = 0; index < splitdescription.length; ++index )
        {
            description += splitdescription[index];
            if ( index < splitdescription.length - 1 )
            {
                description += " ";
            }

            if ( index == 3 )
            {
                description += "</first><afterfirst>";
            }
        }
        description += "</afterfirst>";
    }

    description = replacecharacter( description, '*', '<emphasis>', '</emphasis>' );
    description = replacecharacter( description, '%', '<inner>', '</inner>' );

    return description;
}

function processdrawntextsegment( type, iscurrent, differenceovertruemax, trueindex, isfirstindex, removefirst, text, index, currentprogress, overridesegmentclass, force )
{
    if ( index <= currentprogress || force )
    {
        var segmentclass = ( iscurrent ) ? "unfaded" : "faded";
        if( overridesegmentclass != null && overridesegmentclass != undefined )
        {
            segmentclass = overridesegmentclass;
        }

        var brightness = " style='color: rgba(209,209,209," + ( iscurrent ? 1.0 : 1.0 - differenceovertruemax ) + ");'";// font-size:" + ( iscurrent && !alliscurrent ? 107 : 90 ) + "%;' ";

        var finaltextsegment = "<" + type + " class='" + segmentclass + "'" + brightness + "index='" + trueindex + "' id='" + trueindex + "'>"
            + processdescriptiontext( text, !isfirstindex || removefirst ) + "</" + type + ">";

        //console.log( finaltextsegment );
        return finaltextsegment;
    }
    else
    {
        return "";
    }
}

function testactivationrequirements( index, currentdescriptionsegment )
{
    var allow = false;
    var requiredtokens = currentdescriptionsegment[index].requiretokens;
    for ( var tokenindex = 0; tokenindex < requiredtokens.length; tokenindex++ )
    {
        var requiredtoken = requiredtokens[tokenindex];
        var requiredtokeninversion = currentdescriptionsegment[index].requireinversion;
        var requiredtokenexists = ( persistentworld.tokens[requiredtoken] !== undefined && persistentworld.tokens[requiredtoken] !== null );
        if ( requiredtokeninversion )
        {
            requiredtokenexists = !requiredtokenexists;
        }
        allow = requiredtokenexists;
        if ( !allow )
        {
            break;
        }
    }

    return allow;
}

function processBodyText( inputdescriptionsegments, isevent, removefirst, length )
{
    var rawtext = '';
    var currentsegment = 0;

    if ( removefirst == undefined || removefirst == null )
    {
        removefirst = false;
    }

    if ( isevent )
    {
        var eventtext = '';

        for ( var index = 0; index < inputdescriptionsegments.length; index++ )
        {
            eventtext += inputdescriptionsegments[index].text;//replacecharacter( descriptionsegments[index].text, '*', '<emphasis>', '</emphasis>' );
        }

        rawtext = eventtext.substr( 0, length );
        if( !currenteventactive )
        {
            rawtext += "...";
        }
    }
    else
    {
        var linkoverrides = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).linkoverrides;
        var linkadditions = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).linkadditions;

        var currentprogress = currentlocationprogress;
        var processeddescriptionsegments = [];
        var pagecount = 1, currentpage = 0;
        const pagelength = 50;

        if ( inputdescriptionsegments.length > pagelength )
        {
            pagecount = Math.floor( inputdescriptionsegments.length / pagelength ) + 1;

            var pageindex = 0;
            while( pageindex < pagecount )
            {
                processeddescriptionsegments.push( inputdescriptionsegments.slice( pageindex * pagelength, ( pageindex * pagelength ) + 5 ) );
                pageindex++;
            }

            var remainder = ( pagecount * pagelength ) - ( ( pagecount * pagelength ) - inputdescriptionsegments.length );
            currentprogress = Math.min( currentprogress, remainder );
            currentpage = Math.floor( currentprogress / pagelength );
            currentprogress = currentprogress % pagelength;

            //console.log( "Inquisitor: Spliting Pages. Segment count: " + inputdescriptionsegments.length + ". Remainder: " + remainder + ". Click progress: " + persistentworld.clickthroughprogress[persistentworld.store.currentWorldLocationID] + ". Pagecount: " + pagecount + ". Current Page: " + currentpage + ". Current Progress: " + currentprogress );
        }
        else
        {
            processeddescriptionsegments.push( inputdescriptionsegments );
        }

        var currentdescriptionsegment = processeddescriptionsegments[currentpage];
        for ( var index = 0; index < currentdescriptionsegment.length; index++ )
        {
            var trueindex = ( currentpage * pagelength ) + index;
            var isfirstindex = index === 0;
            var differencefromcurrent = currentlocationprogress - ( trueindex );
            var differenceovermax     = differencefromcurrent.toFixed() / pagelength.toFixed();
            var differenceovertruemax = differencefromcurrent.toFixed() / inputdescriptionsegments.length.toFixed();
            var alliscurrent = ( inputdescriptionsegments.length - 1 === currentlocationprogress );
            var iscurrent = ( currentlocationprogress === trueindex ) || alliscurrent;

            if ( currentdescriptionsegment[index].requiresactivation )
            {
                var allow = testactivationrequirements( index, currentdescriptionsegment );

                if ( allow )
                {
                    if ( !persistentworld.activations[persistentworld.store.currentWorldLocationID + ":" + index] )
                    {
                        rawtext += processdrawntextsegment( "activenote", iscurrent, differenceovertruemax, trueindex, isfirstindex, removefirst, currentdescriptionsegment[index].text, index, currentprogress );
                    }
                    else
                    {
                        var inactiveactivenotetext = '';
                        if ( currentdescriptionsegment[index].additional )
                        {
                            inactiveactivenotetext += currentdescriptionsegment[index].text;
                        }
                        inactiveactivenotetext += currentdescriptionsegment[index].postactivationtext;

                        rawtext += processdrawntextsegment( "activenoteinactive", iscurrent, differenceovertruemax, trueindex, isfirstindex, removefirst, inactiveactivenotetext, index, currentprogress );
                    }
                }
            }
            else
            {
                var linkfailed = true;
                if ( currentdescriptionsegment[index].islink )
                {
                    var link;
                    if ( !currentdescriptionsegment[index].hasstoredlink )
                    {
                        if ( !currentdescriptionsegment[index].referencedlinkisadditional )
                        {
                            link = linkoverrides[currentdescriptionsegment[index].referencedlink];
                        }
                        else
                        {
                            link = linkadditions[currentdescriptionsegment[index].referencedlink];
                        }
                    }
                    else
                    {
                        link = currentdescriptionsegment[index].storedlink;
                    }

                    //

                    var destination = link.target;

                    var linklocationid = inquisitor.findlocationbyfulltitle( destination );
                    if ( linklocationid === -1 )
                    {
                        linklocationid = inquisitor.findlocationbytitle( destination );
                    }

                    //console.log( link );
                    console.log( "inquisitor: Attempting inline link to: " + linklocationid );

                    var origin = persistentworld.store.currentWorldLocationID;
                    if ( currentdescriptionsegment[index].overrideorigin )
                    {
                        origin = currentdescriptionsegment[index].origin;
                        console.log( "inquisitor: origin overriden: " + origin );
                    }

                    var result = inquisitor.cantraverse( origin, linklocationid, link, true, currentdescriptionsegment[index].ignorestate );
                    if ( !result.success )
                    {
                        console.log( "inquisitor: Refuising link to: " + destination );
                    }
                    else
                    {
                        linkfailed = false;

                        var conceptuallink = currentdescriptionsegment[index].conceptuallink;
                        var isconceptuallink = !( conceptuallink === null || conceptuallink === undefined );

                        var segmentclass = ( !( persistentworld.time.locationtime[linklocationid] === null || persistentworld.time.locationtime[linklocationid] === undefined ) ? 'visited' : 'unvisited' );
                        var finaltextsegment = "inlinelink id='" + trueindex + "' data='" + ( isconceptuallink ? linklocationid : linklocationid ) + "' conceptual='" + isconceptuallink + "' ";

                        rawtext += processdrawntextsegment( finaltextsegment, iscurrent, differenceovertruemax, trueindex, isfirstindex, removefirst, currentdescriptionsegment[index].text, index, currentprogress );
                    }
                }

                if ( linkfailed )
                {
                    //console.log( currentdescriptionsegment[index].text );
                    rawtext += processdrawntextsegment( "inactivenote", iscurrent, differenceovertruemax, trueindex, isfirstindex, removefirst, currentdescriptionsegment[index].text, index, currentprogress, segmentclass, currentdescriptionsegment[index].force );
                }
            }
        }
    }

    //

    tryachivement( inquisitor.getlocation(persistentworld.store.currentWorldLocationID).achievementname );

    //

    //console.log( rawtext );

    return rawtext;
}

function crossfadeelement( element, currentfadelength, currentfadeoutlength, newhtmlforelement, clearonfade )
{
    element.fadeOut( currentfadeoutlength, function ()
    {
        if ( clearonfade !== undefined && clearonfade !== null )
        {
            begindisplay();
        }

        if ( newhtmlforelement !== undefined && newhtmlforelement !== null )
        {
            element.html( newhtmlforelement );
        }

        element.hide().fadeIn( currentfadelength );
    } );
}

var trueaddedlinks = 0;
var addedlinks = 0;
var northvessels = 0;
var southvessels = 0;
var eastvessels  = 0;
var westvessels  = 0;

function addvessel( id, title, force, token, action, link, customid )
{
    if ( token === undefined || token === null )
    {
        token = '';
    }

    if ( action === undefined || action === null )
    {
        action = '';
    }

    if ( customid === undefined || customid === null )
    {
        customid = "#vessels"
    }

    var isleave = false;
    if ( link === undefined || link === null )
    {
        link = inquisitor.getlocation(persistentworld.store.currentWorldLocationID).linkoverrides[title];

        if ( link !== undefined && link !== null )
        {
            //console.log( "inquisitor: Testing override link from: " + link.target );
        }
        else
        {
            isleave = true;
        }
    }

    var isobject = inquisitor.getlocation(id).isobject;
    if ( link !== undefined && link !== null )
    {
        if ( link.displayaschild )
        {
            customid = '#objects';
        }
    }

    //

    var result = inquisitor.cantraverse( persistentworld.store.currentWorldLocationID, id, link, force );
    if ( !result.success )
    {
        console.log( "inquisitor: Refuising link to: " + title );
        return false;
    }

    if ( result.title !== '' )
    {
        title = result.title;
    }

    if ( result.combinationconditional )
    {
        console.log( "inquisitor: Combination condition found, displaying." );

        if ( combinationstore[id] == undefined && combinationstore[id] == null )
        {
            combinationstore[id] = new Array();
            combinationstore[id].push( 9 );
            combinationstore[id].push( 9 );
            combinationstore[id].push( 9 );
            combinationstore[id].push( 9 );
        }

        var finalhtml = '<combination>&middot;';
        var iscorrect = true;

        for ( var digitindex = 0; digitindex < 4; digitindex++ )
        {
            finalhtml += "<digit origin='" + id + "' index='" + digitindex + "'>" + combinationstore[id][digitindex] + "</digit>";
            if ( digitindex < 3 )
            {
                finalhtml += "&middot;";
            }

            if ( combinationstore[id][digitindex] != link.conditional.charAt( digitindex ) )
            {
                iscorrect = false;
            }
        }

        finalhtml += "&middot;</combination><br />"
        $( customid ).append( finalhtml );

        if ( !iscorrect )
        {
            return false;
        }
        else
        {
            $( customid ).append( "\n" );
        }
    }

    //

    if ( isobject || customid === '#objects' )
    {
        var childdescriptioninparent = inquisitor.getlocation(id).descriptioninparent;
        if ( childdescriptioninparent != "" )
        {
            var childdescriptioninparentsegment = { text: childdescriptioninparent.trimRight(), requiresactivation: false, active: false, postactivationtext: '', givetoken: '', requiretoken: '', requireinversion: false, force: true }

            console.log( "inquisitor: Adding Child's Parent Description: " + childdescriptioninparent );
            updatedescription( childdescriptioninparentsegment );
        }
    }

    //
    var vesselid = 'vessel_' + id;
    var vesselmarkup = ( eastvessels + westvessels + northvessels + southvessels ) === 0 ? '' : "<br>";
    vesselmarkup += "<vessel data='" + id + "'";

    if ( token !== '' )
    {
        vesselmarkup += " token='" + token + "'";
    }

    if ( action !== '' )
    {
        vesselmarkup += " action='" + action + "'";
    }

    //

    var direction = 0;
    if ( result.mutualdirection !== -1 )
    {
        direction = result.mutualdirection;
    }

    if ( !isobject && !isleave )
    {
        if ( result.mutualdirection === -1 )
        {
            direction = link.linkdirection;
        }

        vesselmarkup += " direction='" + direction + "'";
    }

    var titleelement = "";
    var actualtitle = title;
    var visited = !( persistentworld.time.locationtime[id] === null || persistentworld.time.locationtime[id] === undefined ) ? 'visited' : 'unvisited';
    if ( direction > 0 )
    {
        if ( direction > 4 )
        {
            direction = 3;
        }
        customid = "#" + inttodirection( direction );
        $( customid + "Indictator" ).show();

        var style = ' ';

        switch ( direction )
        {
            case 1:
                northvessels++;
                break;
            case 2:
                eastvessels++;
                break;
            case 3:
                //$( "#South" ).css( "transform", "translateY(" + ( 75 * southvessels ) + "px" );
                $( "#South" ).css( "height", "0px" );
                //style = " top:" + ( southvessels * 75 ) + "px; ";
                //vesselmarkup += style;

                southvessels++;
                break;
            case 4:
                westvessels++;
                break;
        }

        titleelement = "<vesseltitle" + style + "class='" + visited + "'>\n" + title + "</vesseltitle>"; //To the " + inttodirection( direction ) + "    border-bottom: 0px solid #333;
        actualtitle = inquisitor.getlocation( id ).name;

        console.log( titleelement );

        $( "#endofnote" ).css( 'margin-bottom', "" + ( 30 + ( northvessels > 0 ? 50 * northvessels : 20 ) ) + 'px' );
        $( customid ).css( 'border-bottom', "1px solid #4a4a4a" );
    }

    $( customid ).append( vesselmarkup + " id='" + vesselid + "'>" + actualtitle + "</vessel>" + titleelement );
    $( customid ).find( "#" + vesselid ).addClass( visited ); //attr( 'title', inttodirection( direction ) ).
    crossfadeelement( $( customid ).find( "#" + vesselid ), ( 1 + 1 * trueaddedlinks ) * 1500, 0 )
    addedlinks++;
    trueaddedlinks++;
}

function displayWorld()
{
    crossfadeelement( $( "#core" ), 1500, 500, null, true );
}

function displayvessels()
{
    var vesselsadded = {};

    var siblingresults = inquisitor.enumeratesiblings( persistentworld.store.currentWorldLocationID );
    var siblings = siblingresults.siblingsfound;

    for ( var index in siblings )
    {
        var siblingname = inquisitor.getlocation( siblings[index] ).name;
        //addvessel( siblings[index], siblingname, false );
        //console.log( "Inquisitor: Attempting to link to sibling, " + siblingname );
    }

    //

    finaldescriptionsegments = inquisitor.getlocation(persistentworld.store.currentWorldLocationID).descriptionsegments.slice();

    var children = inquisitor.enumeratechildren( persistentworld.store.currentWorldLocationID );
    console.log( children );
    for ( var index in children )
    {
        var isobject = inquisitor.getlocation( children[index] ).isobject;
        if ( isobject )
        {
            console.log( "Inquisitor: Attempting to link to child, " + children[index] );
            addvessel( children[index], inquisitor.getlocation( children[index] ).name, true, null, null, null, '#objects' );
        }
    }

    //

    var currentfadelength = 2000;
    var currentfadeoutlength = 100;

    /*if ( inquisitor.getlocation(persistentworld.store.currentWorldLocationID].descriptionsegments.length > 0 )
    {
        var illustration = inquisitor.getlocation(persistentworld.store.currentWorldLocationID].illustration;

        if ( illustration !== "" && !currenteventactive )
        {
            illustration = "<img src='" + illustration + "' id='currentitem'/>"
        }

        var newtext = processBodyText( finaldescriptionsegments, false, false );
        var rawtext = processBodyText( finaldescriptionsegments, false, true );

        crossfadeelement( $( "#note" ), currentfadelength, currentfadeoutlength, illustration + newtext );
        currentfadelength += 500;
    }*/

    //

    if ( addedlinks > 0 )
    {
        //$( "#vessels" ).append( '\n' );
    }

    //

    var availableadditions = inquisitor.processlinkadditions( persistentworld.store.currentWorldLocationID );
    for ( var index in availableadditions )
    {
        var referenceid = parseInt( availableadditions[index].index );
        var referencetitle = availableadditions[index].title;
        var referencename = availableadditions[index].initiatinglink.target;

        //console.log( referencetitle );
        //console.log( referencename );

        addvessel( availableadditions[index].index, availableadditions[index].title, true, availableadditions[index].initiatinglink.token,
                availableadditions[index].initiatinglink.action, availableadditions[index].initiatinglink );
            vesselsadded[referenceid] = ( { index: referenceid, priority: !( referencename === referencetitle ) } );
    }

    //

    var references = inquisitor.accessreferencebufferforid( persistentworld.store.currentWorldLocationID );
    if ( references !== undefined && references !== null )
    {
        for ( var index in references )
        {
            var referenceid = references[index].index;
            var referencetitle = references[index].linktitle;
            var referencename = inquisitor.getlocation( references[index].index ).name;

            //console.log( referencetitle );
            //console.log( referencename );

            var allow = true;
            var firstaddition = vesselsadded[referenceid];
            var firstadditionfound = firstaddition !== null && firstaddition !== undefined;
            if ( firstadditionfound )
            {
                allow = !firstaddition.priority;
                console.log( allow );
            }
            
            if ( allow && !firstadditionfound && ( referencename === referencetitle ) )
            {
                referencetitle = inquisitor.findpreviousreferencetitle( referenceid );
            }

            if ( allow )
            {
                addvessel( referenceid, referencetitle, true );
                vesselsadded[referenceid] = ( { index: referenceid, priority: !( referencename === referencetitle ) } );
            }
        }
    }

    //console.log( vesselsadded );

    //

    if ( inquisitor.getlocation(persistentworld.store.currentWorldLocationID).isobject || persistentworld.store.currentWorldLocationID === 0 )
    {
        var parentid = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).parentid;
        var leavemessage = "Leave";
        var leaveid = parentid;
        /*if ( !siblingresults.isfirstchild && !inquisitor.getlocation(siblingresults.firstchild).isobject && leaveid == -1 )
        {
            leaveid = siblingresults.firstchild;
            console.log( "inquisitor: Leaving to first sibling: " + leaveid );
        }*/
        if ( leaveid === -1 || ( leaveid == undefined && leaveid == null ) )
        {
            leaveid = inquisitor.getparent( persistentworld.store.currentWorldLocationID ).parentid;
            console.log( "inquisitor: Leaving to first child of parent: " + leaveid );
        }
        else
        {
            console.log( "inquisitor: Leaving to parent: " + leaveid );
        }

        if ( persistentworld.store.currentWorldLocationID === 0 )
        {
            leaveid = 34;
            leavemessage = "Enter";
            //console.log( inquisitor.world );
        }

        console.log( "inquisitor: Leave goes to: " + leaveid );

        if ( leaveid > -1 )
        {
            addvessel( leaveid, leavemessage, true );
        }

        /*else
        {
            child = 0;
            for ( var objectname in inquisitor.world.regions )
            {
                var childid = inquisitor.world.regions[objectname].id;
                if ( childid != 0 && childid != -1 && childid != currentWorldLocationID )
                {
                    console.log( "inquisitor: Enumerating region: " + childid );
                    addvessel( childid, inquisitor.getlocation(childid].region );
                }
                child++;
            }
        }*/

    }

    if ( eastvessels + northvessels + westvessels + southvessels > 0 )
    {
        $( "#diamond" ).show();
        $( ".diamondradial" ).show();
        //$( "#diamond" ).fadeIn( 500 );
       // $( ".diamondradial" ).fadeIn( 500 );
    }
    else
    {
       // $( "#diamond" ).hide();
       // $( ".diamondradial" ).hide();
    }

}

function begindisplay()
{
    clear();

    //

    var currentlocation = inquisitor.getlocation( persistentworld.store.currentWorldLocationID );
    if ( currentlocation.state !== persistentworld.world.state )
    {
        persistentworld.world.state = currentlocation.state.trim();
        console.log( 'inquisitor: state set to: ' + persistentworld.world.state );
    }

    //

    if ( persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] === undefined || persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] === null )
    {
        persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] = false;
    }

    if ( currentlocation.hasconcepts )
    {
        if ( persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID] === undefined || persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID] === null )
        {
            persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID] = currentlocation.conceptids[0];
        }
    }

    updatetime();
    persistentworld.entity.locations = inquisitor.writeentities();

    //

    localStorage.setItem( "activations", JSON.stringify( persistentworld.activations ) );
    localStorage.setItem( "tokens", JSON.stringify( persistentworld.tokens ) );
    localStorage.setItem( "store", JSON.stringify( persistentworld.store ) );
    localStorage.setItem( "time", JSON.stringify( persistentworld.time ) );
    localStorage.setItem( "entity", JSON.stringify( persistentworld.entity ) );
    localStorage.setItem( "lys", JSON.stringify( persistentworld.lys ) );
    localStorage.setItem( "world", JSON.stringify( persistentworld.world ) );

    //

    /*if ( !currenteventactive )
    {
        var historytextfinal = "<history>"; var addedcount = 0;
        if ( texthistory.length > 0 )
        {
            while ( addedcount < texthistory.length )
            {
                if ( addedcount == 0 )
                {
                    historytextfinal += "<faded>" + texthistory[addedcount] + "</faded>";
                }
                else
                {
                historytextfinal += texthistory[addedcount];
                //}
                addedcount++;
            }
        }

        var historylengthtest = 0;
        while ( true )
        {
            $( "#history" ).html( historytextfinal.substring( historylengthtest, historytextfinal.length - 1 ) + "</history>" );
            if ( $( "#history" ).innerHeight() < 75 )
                break;
            historylengthtest++;
        }
    }
    else
    {
        $( "#history" ).html( "" );
    }*/

    //

    /*
                    <div class="regionholderholder">
                    <div id='regionholder' class='regionholder'></div>
                </div>*/

    if ( true ) // inquisitor.getlocation(persistentworld.store.currentWorldLocationID).displayparent
    {
        var regiontext = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).subregion + ", " + inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).region;
        $( "#superlocation" ).html( regiontext );
        //world.rawlocations[persistentworld.store.currentWorldLocationID].name = location.namesegments[location.namesegments.length - 2] + " - " + inquisitor.getlocation(persistentworld.store.currentWorldLocationID].name;
    }

    var currentfadelength = 500;
    var currentfadeoutlength = 100;

    crossfadeelement( $( "#location" ), currentfadelength, currentfadeoutlength, inquisitor.getlocation(persistentworld.store.currentWorldLocationID).name );
    currentfadelength += 500;

    crossfadeelement( $( "#regionholder" ), currentfadelength, currentfadeoutlength, "<h2 id='region' class='region'>" + inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).region + "</h2>" );
    //crossfadeelement( $( "#regionholder" ), currentfadelength, currentfadeoutlength, "<div class='line-left line'></div><h2 id='region' class='region'>" + inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).region + "</h2><div class='line-right line'></div>" );
    currentfadelength += 500;

    // crossfadeelement( $( "#subregionholder" ), currentfadelength, currentfadeoutlength, "<div class='line-left line'></div><h2 id='subregion' class='region'>" + inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).subregion + "</h2><div class='line-right line'></div>" );
    // currentfadelength += 500;

    $( "#eventprompt" ).hide();

    if ( inquisitor.getlocation(persistentworld.store.currentWorldLocationID).eventid != -1 )
    {
        var eventid = inquisitor.getlocation(persistentworld.store.currentWorldLocationID).eventid;
        var rawevent = inquisitor.world.rawevents[eventid];
        if ( rawevent.text !== '' )
        {
            var allow = ( rawevent.condition === '' );

            if ( rawevent.timedcondition !== -1 )
            {
                allow = rawevent.timedconditionislocal ? ( rawevent.timedcondition <= persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID] ) : ( rawevent.timedcondition <= persistentworld.time.globaltime );
                console.log( "inquisitor: Found timed condition. Required : " + rawevent.timedcondition );
            }
            else if ( rawevent.condition !== '' )
            {
                allow = !( persistentworld.tokens[rawevent.condition] === undefined || persistentworld.tokens[rawevent.condition] === null );
                console.log( "inquisitor: Found standard condition" );
            }

            console.log( "inquisitor: Allowing? " + allow );

            if ( allow )
            {
                var lengthtest = 600;
                while ( true )
                {
                    var rawnewtext = processBodyText( rawevent.descriptionsegments, true, false, currenteventactive ? 10000 : lengthtest ) + "\n";
                    var eventprompttext = currenteventactive ? "<img src='img/item/TBIM_ITEM_Myno_512.png' id='eventmynobackground' /><img src='img/TBIM_DECO_Twirl_1024x64.png' class='eventdeco' id='eventdeco2' />\n\n\n\n<div id='prompttext'>Continue?<div/>"
                        : "<p id='eventfader' class='eventfader' /><img src='img/item/TBIM_ITEM_Myno_512.png' id='eventprompt' /><div id='prompttext'>Activate Memory?<div/>";
                    var newtext = ( currenteventactive ? "<p id='eventexclusionfader1' class='eventexclusionfader' />" : "" ) + "<div class='event" + ( currenteventactive ? "active" : "inactive" ) + "'>" + rawnewtext + eventprompttext + "</div>" + ( currenteventactive ? "<p id='eventexclusionfader2' class='eventexclusionfader' />" : "" );
                    //<img src='img/TBIM_DECO_Footer_1024x64.png' class='eventdeco' id='eventdeco1' />
                    $( "#event" ).html( newtext );

                    if ( $( "#event" ).innerHeight() < 200 || currenteventactive )
                        break;
                    lengthtest--;
                }

                $( "#eventprompt" ).show();

                if( rawevent.givetoken != '' )
                {
                    persistentworld.tokens[rawevent.givetoken] = persistentworld.store.currentWorldLocationID;
                }

                //

                if ( currenteventactive )
                {
                    tryachivement( rawevent.achievementname );

                    if ( rawevent.soundurl != '' && !soundmuted )
                    {
                        var sound = new buzz.sound( rawevent.soundurl.trim(), {
                            formats: ["ogg", "mp3", "wav"]
                        } );
                        sound.play();

                        console.log( "inquisitorParse: Playing sound: " + rawevent.soundurl );
                    }
                }

                //
            }
        }
    }

    $( "#dialogue" ).hide();
    $( "#dialoguefader1" ).hide();
    $( "#dialoguefader2" ).hide();
    $( "#dialoguedivider1" ).hide();
    $( "#dialoguedivider2" ).hide();
    indialogue = false;

    if ( inquisitor.getlocation(persistentworld.store.currentWorldLocationID).dialogueids.length > 0 )
    {
        console.log( "inquisitor: Found Dialogue(s)" );

        for ( var dialogueindex = 0; dialogueindex < inquisitor.getlocation(persistentworld.store.currentWorldLocationID).dialogueids.length; dialogueindex++ )
        {
            console.log( "inquisitor: Found First Dialogue" );
            var dialogueid = inquisitor.getlocation(persistentworld.store.currentWorldLocationID).dialogueids[dialogueindex];
            var rawdialogue = inquisitor.world.rawdialogue[dialogueid];

            var allow = true;
            if ( rawdialogue.requiresactivation )
            {
                var requiredtoken = rawdialogue.requiretokens[0];
                var requiredtokeninversion = rawdialogue.requireinversion;

                console.log( "inquisitor: Found Activation Requirement: " + requiredtoken );

                var requiredtokenexists = ( persistentworld.tokens[requiredtoken] !== undefined && persistentworld.tokens[requiredtoken] !== null );
                if ( requiredtokeninversion )
                {
                    console.log( "inquisitor: Found Activation Inversion" );
                    requiredtokenexists = !requiredtokenexists;
                }
                allow = requiredtokenexists;
            }

            if ( allow )
            {
                console.log( "inquisitor: Allowing Dialogue, Length: " + rawdialogue.text.length + ". Text: " + rawdialogue.rawtext );
                console.log( "inquisitor: Dialogue Progress: " + rawdialogue.readprogress );

                if ( rawdialogue.readprogress < rawdialogue.text.length )
                {
                    console.log( "inquisitor: Continuing Dialogue" );

                    $( "#dialogue" ).show();
                    $( "#dialoguefader1" ).show();
                    $( "#dialoguefader2" ).show();
                    //$( "#dialoguedivider1" ).show();
                    $( "#dialoguedivider2" ).show();
                    indialogue = true;

                    if ( rawdialogue.givetoken !== '' )
                    {
                        persistentworld.tokens[rawdialogue.givetoken] = persistentworld.store.currentWorldLocationID;
                    }

                    if ( rawdialogue.soundurl !== '' && !soundmuted && rawdialogue.readprogress == 0 )
                    {
                        var sound = new buzz.sound( rawdialogue.soundurl.trim(), {
                            formats: ["ogg", "mp3", "wav"]
                        } );
                        sound.play();

                        console.log( "inquisitorParse: Playing sound: " + rawdialogue.soundurl );
                    }

                    if ( rawdialogue.readprogress === rawdialogue.text.length - 1 )
                        tryachivement( rawdialogue.achievementname );

                    var newtext = "<div class='dialogue'>" + processBodyText( rawdialogue.text[rawdialogue.readprogress], true, false ) + "\n\n</div>";
                    $( "#dialogue" ).html( newtext );
                    rawdialogue.readprogress++;

                    break;
                }
            }
        }
    }

    //$( "#lastnote" ).html( inquisitor.getlocation(lastWorldLocationID].desc );
    //$( "#lastlastnote" ).html( inquisitor.getlocation(lastlastWorldLocationID].desc );

    //

    /*if ( persistentworld.clickthroughprogress[persistentworld.store.currentWorldLocationID] >= inquisitor.getlocation(persistentworld.store.currentWorldLocationID].descriptionsegments.length - 1 )
    {
        displayvessels();
        crossfadeelement( $( "#notecontinue" ), 750, 0, "" );
    }
    else
    {
        crossfadeelement( $( "#notecontinue" ), 750, 0, "\nContinue..." );
    }*/

    //

    var righticonbartext = "";
    righticonbartext += "<img src='img/ui/TBIM_UI_Credits_256.png' class='leftbaricon " + ( !isincredits ? "" : "Has" ) + "' id='creditsbutton' />";
    righticonbartext += "<img src='img/ui/TBIM_UI_Music_256.png' class='leftbaricon " + ( soundmuted ? "" : "Has" ) + "' id='mutebutton' />";
    //$( "#righticonbar" ).html( righticonbartext );

    var lefticonbartext = "";
    lefticonbartext += "<img src='img/item_icon/TBIM_ITEMICON_Myno0" + ( currenteventactive ? "2" : "1" ) + "_256.png' class='leftbaricon " + ( persistentworld.tokens["MynometerActivated"] !== undefined ? "Has" : "" ) + "' id='MynometerActivated' />";

    /*if ( !currenteventactive && !indialogue )
    {
        lefticonbartext += "<img src='img/item_icon/TBIM_ITEMICON_Lantern_256.png' class='leftbaricon " + ( persistentworld.tokens["HasLantern"] !== undefined ? "Has" : "" ) + "' id='HasLantern' />";
        lefticonbartext += "<img src='img/item_icon/TBIM_ITEMICON_HourKey_256.png' class='leftbaricon " + ( persistentworld.tokens["HasHourKey"] !== undefined ? "Has" : "" ) + "' id='HasHourKey' />";
        lefticonbartext += "<img src='img/item_icon/TBIM_ITEMICON_MinuteKey_256.png' class='leftbaricon " + ( persistentworld.tokens["HasMinuteKey"] !== undefined ? "Has" : "" ) + "' id='HasMinuteKey' />";
        lefticonbartext += "<img src='img/item_icon/TBIM_ITEMICON_MoonKey_256.png' class='leftbaricon " + ( persistentworld.tokens["HasMoonKey"] !== undefined ? "Has" : "" ) + "' id='HasMoonKey' />";
        lefticonbartext += "<img src='img/item_icon/TBIM_ITEMICON_SunKey_256.png' class='leftbaricon " + ( persistentworld.tokens["HasSunKey"] !== undefined ? "Has" : "" ) + "' id='HasSunKey' />";
        lefticonbartext += "<img src='img/item_icon/TBIM_ITEMICON_IronKey_256.png' class='leftbaricon " + ( persistentworld.tokens["HasPlainKey"] !== undefined ? "Has" : "" ) + "' id='HasPlainKey' />";
        lefticonbartext += "<img src='img/item_icon/TBIM_ITEMICON_Record_256.png' class='leftbaricon " + ( persistentworld.tokens["HasRecordScriabin"] !== undefined ? "Has" : "" ) + "' id='HasRecordScriabin' />";
    }
    $( "#lefticonbar" ).html( lefticonbartext );*/

    //
    //

    trybegintimeline();
    toggletimeline();
}

//$( 'body' ).addClass( 'fade' );
function clear()
{
    var center = ( $( "#core" ).height() - $( "#div4" ).height() ) / 2;
    console.log( "inquisitor: Center: " + center );
    //$( "#div4" ).css( { "top": center } );

    $( "#superlocation" ).html( "" );
    $("#location").html("");
    $( "#note" ).html( "" );
    $( "#event" ).html( "" );
    $( "#seperator" ).html( "" );
    $( "#vessels" ).html( "" );
    $( "#objects" ).html( "" );

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

    northvessels = 0;
    southvessels = 0;
    eastvessels  = 0;
    westvessels = 0;
    timelineeventsadded = 0;

    $( "#region" ).html( "" );
    $( "#subregion" ).html( "" );
    $( "#notenew" ).html( "" );
    
    addedlinks = 0;
    trueaddedlinks = 0;
    initiatedclearcountdown = false;
    currentlocationprogress = 0;
    showingvessels = false;
    expanddescription = false;
    currentconceptprogress = 0;
    conceptlinksdisplayed = false;
    conceptsover = false;

    $( "#dialogue" ).hide();
    $( "#dialoguefader1" ).hide();
    $( "#dialoguefader2" ).hide();
    $( "#dialoguedivider1" ).hide();
    $( "#dialoguedivider2" ).hide();

    //$( "#history" ).html( "" );
}