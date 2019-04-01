Inquisitor.prototype.initializeInteraction = function()
{
    if ( isusingnwjs )
    {
        //testSteamAPI();
    }

    //

    //jQuery.scrollSpeed(100, 800);
    //$("#div4").niceScroll( { scrollspeed : 100, horizrailenabled : false, cursorborder : "0px solid #000", cursorborderradius : "0px", cursorwidth : 2, cursorcolor : "#eaeaea", cursoropacitymax : 0.75, background : "background-color: #000" } );
    $("#note").niceScroll( { scrollspeed : 100, horizrailenabled : false, cursorborder : "0px solid #000", cursorborderradius : "0px", cursorwidth : 2, cursorcolor : "#eaeaea", cursoropacitymax : 0.75, background : "background-color: #000" } );
    $("#debug").niceScroll( { scrollspeed : 100, horizrailenabled : false, cursorborder : "0px solid #000", cursorborderradius : "0px", cursorwidth : 2, cursorcolor : "#eaeaea", cursoropacitymax : 0.75, background : "background-color: #000" } );

    $( document ).on( 'mousemove', function ( event )
    {
        window.requestAnimationFrame( function ()
        {
            inquisitor.moveBackground( event );
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
            //gui.Window.get().showDevTools();
            inquisitor.logic.viewingtimeline = !inquisitor.logic.viewingtimeline;
            inquisitor.drawcontent();
        }

       /* if ( e.keyCode == 9 )
        {
            .inquisitor.logic.viewingtimeline = !inquisitor.logic.viewingtimeline;
            inquisitor.drawcontent();
        }

        if ( e.keyCode == 68 )
        {
            //gui.Window.get().showDevTools();
            inquisitor.logic.viewingtimeline = !inquisitor.logic.viewingtimeline;
            inquisitor.drawcontent();
        }

        if ( e.keyCode == 72 )
        {
            inquisitor.render.showingconsole = !inquisitor.render.showingconsole;
            inquisitor.drawcontent();
        }

        if ( e.keyCode == 69 )
        {
            inquisitor.toggleExpand();
        }*/

        if ( e.keyCode == 83 )
        {
            persistentworld.noparallax = !persistentworld.noparallax;
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
                    const remote = require('electron').remote;
                    let w = remote.getCurrentWindow();
                    w.close();
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
                    inquisitor.newsave();
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

        if ( e.keyCode == 67 && initiatedclearcountdown )
        {
            lastKeyUpAt = new Date();
            initiatedclearcountdown = false;
            $( "#clearprompt" ).html( "" );
        }
    });

    $( document ).on( "click", "#mutebutton", function ()
    {
        persistentworld.soundmuted = !persistentworld.soundmuted;
        redraw();
    } );

    $( document ).on( "click", "#creditsbutton", function ()
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

    $( document ).on( "click", "#event", function ()
    {
        inquisitor.logic.currenteventactive = true;
        inquisitor.log( 0, "Event Prompt Clicked.", "Interaction" );
        //inquisitor.updatetime( false, false );
        redraw();
    } );

    $( document ).on( "click", "#notecontinue", function ()
    {
        inquisitor.logic.currenteventactive = false;
        inquisitor.log( 0, "Event Prompt Clicked.", "Interaction" );
        redraw();
    } );

    $( document ).on( "click", "digit", function ()
    {
        var value = targetLocation = $( this ).text();
        var origin = targetLocation = $( this ).attr( "origin" );
        var index = targetLocation = $( this ).attr( "index" );
        inquisitor.log( 0, "Digit Clicked. Current value: " + value + ". From: " + origin + ". Index: " + index, "Interaction" );

        inquisitor.logic.combinationstore[origin][index]++;

        if ( inquisitor.logic.combinationstore[origin][index] > 9 )
        {
            inquisitor.logic.combinationstore[origin][index] = 0;
        }

        clearvessels();
        inquisitor.displayvessels();
    } );

    $( document ).on( "click", "vessel, inlinelink", function ()
    {
        targetLocation = $( this ).attr( "data" );

        var token = $( this ).attr( "token" );
        if ( token !== '' && token !== undefined )
        {
            persistentworld.tokens[token.trim()] = persistentworld.store.currentWorldLocationID;
            inquisitor.log( 0, "Adding token: " + token, "Interaction" );
        }

        var action = $( this ).attr( "action" );
        if ( action !== '' && token !== action )
        {
            if ( action === 'hide' )
            {
                persistentworld.world.locationhidden[persistentworld.store.currentWorldLocationID] = true;
                inquisitor.log( 1, "Hiding Object: " + persistentworld.store.currentWorldLocationID, "Interaction" );
            }
            if ( action === 'reset' )
            {
                inquisitor.newsave();
                redraw();
            }

            inquisitor.log( 1, "Action performed: " + action, "Interaction" );
        }

        inquisitor.logic.lastlastWorldLocationID = inquisitor.logic.lastWorldLocationID;

        var conceptual = $( this ).attr( "conceptual" );
        if ( conceptual !== null && conceptual !== undefined )
        {
            persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID] = targetLocation;
            currentconceptprogress = 0;
            conceptlinksdisplayed = false;

            //var newtext = processBodyText( inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments );
            //$( "#note" ).html( newtext );

            inquisitor.updatetime();
            redraw();
        }
        else
        {
            persistentworld.store.lastWorldLocationID = persistentworld.store.currentWorldLocationID;
            persistentworld.store.currentWorldLocationID = targetLocation;

            inquisitor.logic.istransitioning = true;

            var transition = $( this ).attr( "transition" );

            if( transition !== '' && !( transition == undefined || transition == null ) )
            {
              inquisitor.log( 1, "Starting transition.", "Interaction" );

              $( '#' + inquisitor.render.currentbackgroundbuffer ).fadeOut( 3250,  function ()
              {
                $( '#' + inquisitor.render.currentbackgroundbuffer ).fadeIn( 4000 );
              } );

              $( "#core" ).fadeOut( 1500, function ()
              {
                $( "#transitiontext" ).html( transition );
                /*$.smoothScroll( {
                    scrollElement: $( '.content' ),
                    speed: 600,
                    easing: 'swing',
                    offset: inquisitor.findcenter( '#transitiontext' )
                } );*/
                $( "#transitiontext" ).hide();
                $( "#transitiontext" ).fadeIn( 1750, function ()
                {
                  $( "#transitiontext" ).fadeOut( 3000, function ()
                  {
                    $( "#core" ).fadeOut( 2500, function ()
                    {
                        redraw();
                    } );
                  } );
                } );
              } );
            }
            else
            {
              redraw();
            }
        }
    } );

    $( document ).on( "click", "html", function ()
    {
        if( !inquisitor.logic.istransitioning )
        {
            /*if( inquisitor.logic.currenteventactive )
            {
                inquisitor.logic.currenteventactive = false;
            }*/
            tryupdatetime();
        }
    } );

    $( document ).on( "click", "#lysdiamond", function ()
    {
        if ( persistentworld.lys.vialcount > 0 )
        {
            persistentworld.lys.vialcount--;
            updatetime( persistentworld.world.state !== 'linear' && persistentworld.world.state !== 'linearinterface' );
        }
    } );

    /*$( "#note" ).scroll( function ()
    {
        tryupdatetime();
    } );*/

    //

    $( document ).on( "click", "activenote", function ()
    {
        var index = $( this ).attr( "index" );
        inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments[index].active = true;
        persistentworld.activations[persistentworld.store.currentWorldLocationID + ":" + index] = true;

        inquisitor.log( 0, "Activenote: Clicked." );

        var givetoken = inquisitor.getlocation(persistentworld.store.currentWorldLocationID).descriptionsegments[index].givetoken;
        if ( givetoken !== '' )
        {
            persistentworld.tokens[givetoken] = persistentworld.store.currentWorldLocationID;
            inquisitor.log( 0, "Activenote: Given token:" + givetoken );
            //inquisitor.log( 0, "Activenote: Hiding Object: " + persistentworld.store.currentWorldLocationID, "Interaction" );
            
            if ( givetoken === 'FreeRoam' )
            {
                //console.log( "inquisitor: Entering Free Roam" );
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

            inquisitor.displayvessels();
            inquisitor.drawicons();
            //redraw();
        }

        $( "#note" ).fadeOut( 250, function ()
        {
            var newtext = inquisitor.processBodyText( inquisitor.getlocation(persistentworld.store.currentWorldLocationID).descriptionsegments );
            $( "#note" ).html( newtext );
          $( "#note" ).fadeIn( 750, function ()
          {
          } );
        } );
    } );
}

Inquisitor.prototype.drawicons = function()
{
    inquisitor.log( 0, "Drawing Icons" );

    var icons = inquisitor.world.iconbuffer;
    var iconhtml = '';

    iconhtml += '<p id="mutebutton" class="icon fonticon">';
    if( persistentworld.soundmuted )
    {
        iconhtml += 'm';
    } 
    else 
    {
        iconhtml += 's';
    }
    iconhtml += '</p>';

    //'<p id="twittericon" class="icon fonticon">T</p><p id="facebookicon" class="icon fonticon">F</p><p id="instagramicon" class="icon fonticon">I</p>';
    //iconhtml += '|<p id="fullscreenbutton" class="icon">fullscreen</p>';

    for ( var index in icons )
    {
        if( persistentworld.tokens[icons[index].condition] !== undefined && persistentworld.tokens[icons[index].condition] !== null )
        {
            iconhtml += '<img id="icon_' + icons[index].condition + '" class="icon" src="' + icons[index].url + '"/>'

            inquisitor.log( 0, "Condition: " + icons[index].condition + " met for icon: " + icons[index].url, "Interaction" );
        }
    }

    $( "#iconboxmain" ).html( iconhtml );
}

Inquisitor.prototype.begindisplay = function()
{
    var currentlocation = inquisitor.getlocation( persistentworld.store.currentWorldLocationID );
    persistentworld.world.cssadditional = currentlocation.cssadditional.trim();

    if ( currentlocation.state !== persistentworld.world.state )
    {
      persistentworld.world.state = currentlocation.state.trim();
      inquisitor.log( 1, "State changed, new state: " + persistentworld.world.state, "Interaction" );
    }

    clear();

    //

    inquisitor.logic.indialogue = false;

    inquisitor.logic.currentlocationprogress = -1;
    inquisitor.updatetime( false, false );

    //

    if ( persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] === undefined 
      || persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] === null )
    {
        persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] = false;
    }
    if ( persistentworld.world.locationhidden[persistentworld.store.currentWorldLocationID] === undefined 
      || persistentworld.world.locationhidden[persistentworld.store.currentWorldLocationID] === null )
    {
        persistentworld.world.locationhidden[persistentworld.store.currentWorldLocationID] = false;
    }

    if ( currentlocation.hasconcepts )
    {
        if ( persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID] === undefined || persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID] === null )
        {
            persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID] = currentlocation.conceptids[0];
        }
    }

    persistentworld.entity.locations = inquisitor.writeentities();

    //

    inquisitor.savepersistent();

    //

    var regiontext = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).subregion + ", " + inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).region;
    $( "#superlocation" ).html( regiontext );

    var currentfadelength = 500;
    var currentfadeoutlength = 100;

    var locationdisplaytitle = inquisitor.getlocation(persistentworld.store.currentWorldLocationID).name;
    if (locationdisplaytitle.length > 12 )
    {
        $( "#location" ).css( "font-size", '2.25em');
    }
    else
    {
        $( "#location" ).css( "font-size", '2.75em');
    }
    inquisitor.crossfadeelement( $( "#location" ), currentfadelength, currentfadeoutlength, inquisitor.getlocation(persistentworld.store.currentWorldLocationID).name );
    currentfadelength += 500;

    inquisitor.crossfadeelement( $( "#regionholder" ), currentfadelength, currentfadeoutlength, "<h2 id='region' class='region'>" + inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).region + "</h2>" );
    currentfadelength += 500;

    //

    trybegintimeline();
    inquisitor.drawcontent();
}

Inquisitor.prototype.addvessel = function( id, title, force, token, action, link, customid, referencetransition )
{
    if ( inquisitor.getlocation(id) === undefined || inquisitor.getlocation(id) === null )
    {
        console.log( "inquisitorInteract: BAD VESSEL: " + title);
        return false;
    }

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
        console.log( "inquisitor: Refusing link to: " + title );
        return false;
    }

    if ( result.title !== '' && title === '' )
    {
        title = result.title;
    }

    var usereferencetransition = false;
    if ( referencetransition !== '' && !( referencetransition == undefined || referencetransition == null ) )
    {
        //console.log( "inquisitor: Transition: " + referencetransition );
        usereferencetransition = true;
    }

    if ( result.combinationconditional )
    {
        console.log( "inquisitor: Combination condition found, displaying." );

        if ( inquisitor.logic.combinationstore[id] == undefined && inquisitor.logic.combinationstore[id] == null )
        {
            inquisitor.logic.combinationstore[id] = new Array();
            inquisitor.logic.combinationstore[id].push( 9 );
            inquisitor.logic.combinationstore[id].push( 9 );
            inquisitor.logic.combinationstore[id].push( 9 );
            inquisitor.logic.combinationstore[id].push( 9 );
        }

        var finalhtml = '<combination>&middot;';
        var iscorrect = true;

        for ( var digitindex = 0; digitindex < 4; digitindex++ )
        {
            finalhtml += "<digit origin='" + id + "' index='" + digitindex + "'>" + inquisitor.logic.combinationstore[id][digitindex] + "</digit>";
            if ( digitindex < 3 )
            {
                finalhtml += "&middot;";
            }

            console.log( "inquisitor: Digit current: " + inquisitor.logic.combinationstore[id][digitindex] );
            console.log( "inquisitor: Digit required: " + link.conditional.charAt( digitindex ) );

            if ( inquisitor.logic.combinationstore[id][digitindex] != link.conditional.charAt( digitindex ) )
            {
                iscorrect = false;
            }
        }

        finalhtml += "&middot;</combination><br />"
        $( customid ).append( finalhtml );

        if ( !iscorrect )
        {
            console.log( "inquisitor: Combination condition failed." );
            return false;
        }
        else
        {
            console.log( "inquisitor: Combination condition success." );
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

            //console.log( "inquisitor: Adding Child's Parent Description: " + childdescriptioninparent );
            inquisitor.updatedescription( childdescriptioninparentsegment );
        }

        //title = inquisitor.getlocation(id).linktitleinparent;
    }

    //
    var vesselid = 'vessel_' + id;
    var vesselmarkup = ( inquisitor.logic.eastvessels + inquisitor.logic.westvessels + inquisitor.logic.northvessels + inquisitor.logic.southvessels ) === 0 ? '' : "<br>";
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

    if ( !( isobject || customid === '#objects' ) && !isleave )
    {
        /*if ( result.mutualdirection !== -1 )
        {
            direction = result.mutualdirection;
        }*/

        //if ( result.mutualdirection === -1 )
        //{
            direction = link.linkdirection;
        //}

        vesselmarkup += " direction='" + direction + "'";
    }
    else
    {
        direction = -1;
    }

    var style = ' ';
    var titleelement = "";
    var actualtitle = title;
    var visited = !( persistentworld.time.locationtime[id] === null || persistentworld.time.locationtime[id] === undefined ) ? 'visited' : 'unvisited';
    if ( direction > 0 )
    {
        //

        if ( direction === 5 )
        {
            direction = 1;
        }
        if ( direction === 6 )
        {
            direction = 3;
        }

        //

        if ( direction > 4 )
        {
            direction = 3;
        }
        customid = "#" + inquisitor.inttodirection( direction );
        $( customid + "Indictator" ).show();

        switch ( direction )
        {
            case 1:
                inquisitor.logic.northvessels++;
                break;
            case 2:
                inquisitor.logic.eastvessels++;
                break;
            case 3:
                //$( "#South" ).css( "transform", "translateY(" + ( 75 * southvessels ) + "px" );
                //$( "#South" ).css( "height", "0px" );
                //style = " top:" + ( southvessels * 75 ) + "px; ";
                //vesselmarkup += style;

                inquisitor.logic.southvessels++;
                break;
            case 4:
                inquisitor.logic.westvessels++;
                break;
        }

        $( "#endofnote" ).css( 'margin-bottom', "" + ( 35 + ( inquisitor.logic.northvessels > 0 ? 25 * inquisitor.logic.northvessels : 0 ) ) + 'px' );
        actualtitle = inquisitor.getlocation( id ).name;
        titleelement = "<vesseltitle" + style + "class='" + visited + "'>\n" + title + "</vesseltitle>"; //To the " + inttodirection( direction ) + "    border-bottom: 0px solid #333;
    }
    else
    {
        actualtitle = title;
    }

    //$( customid ).css( 'border-bottom', "1px solid #4a4a4a" );
    $( customid ).append( vesselmarkup + ( usereferencetransition ? " transition='" + referencetransition + "'" : "" ) + " id='" + vesselid + "'>" + actualtitle + "</vessel>" + titleelement );
    $( customid ).find( "#" + vesselid ).addClass( visited ); //attr( 'title', inttodirection( direction ) ).
    inquisitor.crossfadeelement( $( customid ).find( "#" + vesselid ), ( 1 + 1 * inquisitor.logic.trueaddedlinks ) * 1500, 0 )
    inquisitor.render.addedlinks++;
    inquisitor.render.trueaddedlinks++;
}
