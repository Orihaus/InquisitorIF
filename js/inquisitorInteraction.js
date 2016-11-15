Inquisitor.prototype.initializeInteraction = function()
{
    if ( isusingnwjs )
    {
        testSteamAPI();
    }

    //

    //jQuery.scrollSpeed(100, 800);
    //$("#div4").niceScroll( { scrollspeed : 100, horizrailenabled : false, cursorborder : "0px solid #000", cursorborderradius : "0px", cursorwidth : 2, cursorcolor : "#eaeaea", cursoropacitymax : 0.75, background : "background-color: #000" } );
    $("#note").niceScroll( { scrollspeed : 100, horizrailenabled : false, cursorborder : "0px solid #000", cursorborderradius : "0px", cursorwidth : 2, cursorcolor : "#eaeaea", cursoropacitymax : 0.75, background : "background-color: #000" } );

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
            inquisitor.logic.viewingtimeline = !inquisitor.logic.viewingtimeline;
            inquisitor.toggletimeline();
        }

        if ( e.keyCode == 68 )
        {
            //gui.Window.get().showDevTools();
            inquisitor.logic.viewingtimeline = !inquisitor.logic.viewingtimeline;
            inquisitor.toggletimeline();
        }

        if ( e.keyCode == 69 )
        {
            inquisitor.toggleExpand();
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
    });

    $( "#mutebutton" ).live( "click", function ()
    {
        inquisitor.logic.soundmuted = !inquisitor.logic.soundmuted;
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
        //console.log( "inquisitor: Event Prompt Clicked." );
        redraw();
    } );

    $( "digit" ).live( "click", function ()
    {
        var value = targetLocation = $( this ).text();
        var origin = targetLocation = $( this ).attr( "origin" );
        var index = targetLocation = $( this ).attr( "index" );
        //console.log( "inquisitor: Digit Clicked. Current value: " + value + ". From: " + origin + ". Index: " + index );

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
            //console.log( "inquisitor: Added " + token );
        }

        var action = $( this ).attr( "action" );
        if ( action !== '' && token !== action )
        {
            if ( action === 'hide' )
            {
                inquisitor.getlocation(persistentworld.store.currentWorldLocationID).hidden = true;
                //console.log( "inquisitor: Hidden Object: " + persistentworld.store.currentWorldLocationID );
            }
            if ( action === 'reset' )
            {
                resetworld();
            }
            //console.log( "inquisitor: Performed Action: " + action );
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
              //console.log( "inquisitor: Performing transition: " + transition );

              $( '#' + inquisitor.render.currentbackgroundbuffer ).fadeOut( 3250,  function ()
              {
                $( '#' + inquisitor.render.currentbackgroundbuffer ).fadeIn( 4000 );
              } );

              $( "#core" ).fadeOut( 1500, function ()
              {
                $( "#transitiontext" ).html( transition );
                $.smoothScroll( {
                    scrollElement: $( '.content' ),
                    speed: 600,
                    easing: 'swing',
                    offset: inquisitor.findcenter( '#transitiontext' )
                } );
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

    $( "html" ).live( "click", function ()
    {
        if( !inquisitor.logic.istransitioning )
        {
          tryupdatetime();
        }
    } );

    $( "#lysdiamond" ).live( "click", function ()
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

    $( "activenote" ).live( "click", function ()
    {
        var index = $( this ).attr( "index" );
        inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments[index].active = true;
        persistentworld.activations[persistentworld.store.currentWorldLocationID + ":" + index] = true;

        var givetoken = inquisitor.getlocation(persistentworld.store.currentWorldLocationID).descriptionsegments[index].givetoken;
        if ( givetoken !== '' )
        {
            persistentworld.tokens[givetoken] = persistentworld.store.currentWorldLocationID;
            //console.log( "inquisitor: Added " + givetoken );

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

            redraw();
        }

        var newtext = inquisitor.processBodyText( inquisitor.getlocation(persistentworld.store.currentWorldLocationID).descriptionsegments );
        $( "#note" ).html( newtext );
    } );
}

Inquisitor.prototype.drawicons = function()
{
  var icons = inquisitor.world.iconbuffer;
  var iconhtml = '<p id="muteicon" class="icon fonticon">s</p>';//'<p id="twittericon" class="icon fonticon">T</p><p id="facebookicon" class="icon fonticon">F</p><p id="instagramicon" class="icon fonticon">I</p>';

  for ( var index in icons )
  {
    console.log(persistentworld.tokens[icons[index].condition]);
    if( persistentworld.tokens[icons[index].condition] !== undefined && persistentworld.tokens[icons[index].condition] !== null )
    {
      iconhtml += '<img id="icon_' + icons[index].condition + '" class="icon" src="' + icons[index].url + '"/>'

      console.log( "inquisitorInteraction: condition: " + icons[index].condition + ", url: " + icons[index].url );
    }
  }

  console.log( iconhtml );

  $( "#iconboxmain" ).html( iconhtml );
}

Inquisitor.prototype.begindisplay = function()
{
    var currentlocation = inquisitor.getlocation( persistentworld.store.currentWorldLocationID );
    //console.log( currentlocation );
    if ( currentlocation.state !== persistentworld.world.state )
    {
      persistentworld.world.state = currentlocation.state.trim();
      //console.log( 'inquisitor: state set to: ' + persistentworld.world.state );
    }

    clear();

    //

    inquisitor.updatetime();

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

    //

    $( "#dialogue" ).hide();
    $( "#dialoguefader1" ).hide();
    $( "#dialoguefader2" ).hide();
    $( "#dialoguedivider1" ).hide();
    $( "#dialoguedivider2" ).hide();
    indialogue = false;

    if ( inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).dialogueids.length > 0 )
    {
        //console.log( "inquisitor: Found Dialogue(s)" );

        for ( var dialogueindex = 0; dialogueindex < inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).dialogueids.length; dialogueindex++ )
        {
            //console.log( "inquisitor: Found First Dialogue" );
            var dialogueid = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).dialogueids[dialogueindex];
            var rawdialogue = inquisitor.world.rawdialogue[dialogueid];

            var allow = true;
            if ( rawdialogue.requiresactivation )
            {
                var requiredtoken = rawdialogue.requiretokens[0];
                var requiredtokeninversion = rawdialogue.requireinversion;

                //console.log( "inquisitor: Found Activation Requirement: " + requiredtoken );

                var requiredtokenexists = ( persistentworld.tokens[requiredtoken] !== undefined && persistentworld.tokens[requiredtoken] !== null );
                if ( requiredtokeninversion )
                {
                    //console.log( "inquisitor: Found Activation Inversion" );
                    requiredtokenexists = !requiredtokenexists;
                }
                allow = requiredtokenexists;
            }

            if ( allow )
            {
                //console.log( "inquisitor: Allowing Dialogue, Length: " + rawdialogue.descriptionsegments.length + ". Text: " + rawdialogue.rawtext );
                //console.log( "inquisitor: Dialogue Progress: " + rawdialogue.readprogress );
                //console.log( rawdialogue.descriptionsegments );
                if ( rawdialogue.readprogress < rawdialogue.descriptionsegments.length + 1 )
                {
                    //console.log( "inquisitor: Continuing Dialogue" );

                    $( "#dialogue" ).show();
                    $( "#dialoguefader1" ).show();
                    $( "#dialoguefader2" ).show();
                    //$( "#dialoguedivider1" ).show();
                    $( "#dialoguedivider2" ).show();
                    indialogue = true;

                    var sectionholderhtml = '';
                    var dialoguecount = rawdialogue.descriptionsegments.length;
                    for ( var dialogueindex = 1; dialogueindex < dialoguecount + 1; dialogueindex++ )
                    {
                        //sectionholderhtml += "<h3 id='section" + dialogueindex + "'" + ( rawdialogue.readprogress === dialogueindex ? " class='activesection'" : '' ) + "></h3>";
                    }

                    $( "#sectionholderrotator" ).html( sectionholderhtml );

                    if ( rawdialogue.givetoken !== '' && rawdialogue.readprogress == rawdialogue.descriptionsegments.length )
                    {
                        persistentworld.tokens[rawdialogue.givetoken] = persistentworld.store.currentWorldLocationID;
                    }

                    if ( rawdialogue.soundurl !== '' && !inquisitor.logic.soundmuted && rawdialogue.readprogress == 0 )
                    {
                        var sound = new buzz.sound( rawdialogue.soundurl.trim(), {
                            formats: ["ogg", "mp3", "wav"]
                        } );
                        sound.play();

                        //console.log( "inquisitorParse: Playing sound: " + rawdialogue.soundurl );
                    }

                    if ( rawdialogue.readprogress === rawdialogue.descriptionsegments.length - 1 )
                        tryachivement( rawdialogue.achievementname );

                    var newtext = "" + inquisitor.processBodyText( rawdialogue.descriptionsegments.slice( rawdialogue.readprogress - 1, rawdialogue.readprogress ), false, false );
                    $( "#note" ).html( newtext );
                    rawdialogue.readprogress++;

                    break;
                }
            }
        }
    }

    persistentworld.entity.locations = inquisitor.writeentities();

    //

    inquisitor.savepersistent();

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

    inquisitor.crossfadeelement( $( "#location" ), currentfadelength, currentfadeoutlength, inquisitor.getlocation(persistentworld.store.currentWorldLocationID).name );
    currentfadelength += 500;

    inquisitor.crossfadeelement( $( "#regionholder" ), currentfadelength, currentfadeoutlength, "<h2 id='region' class='region'>" + inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).region + "</h2>" );
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
                //console.log( "inquisitor: Found timed condition. Required : " + rawevent.timedcondition );
            }
            else if ( rawevent.condition !== '' )
            {
                allow = !( persistentworld.tokens[rawevent.condition] === undefined || persistentworld.tokens[rawevent.condition] === null );
                //console.log( "inquisitor: Found standard condition" );
            }

            //console.log( "inquisitor: Allowing? " + allow );

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

                    if ( rawevent.soundurl != '' && !inquisitor.logic.soundmuted )
                    {
                        var sound = new buzz.sound( rawevent.soundurl.trim(), {
                            formats: ["ogg", "mp3", "wav"]
                        } );
                        sound.play();

                        //console.log( "inquisitorParse: Playing sound: " + rawevent.soundurl );
                    }
                }

                //
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
    righticonbartext += "<img src='img/ui/TBIM_UI_Credits_256.png' class='leftbaricon " + ( !inquisitor.logic.isincredits ? "" : "Has" ) + "' id='creditsbutton' />";
    righticonbartext += "<img src='img/ui/TBIM_UI_Music_256.png' class='leftbaricon " + ( inquisitor.logic.soundmuted ? "" : "Has" ) + "' id='mutebutton' />";
    //$( "#righticonbar" ).html( righticonbartext );

    var lefticonbartext = "";
    lefticonbartext += "<img src='img/item_icon/TBIM_ITEMICON_Myno0" + ( inquisitor.logic.currenteventactive ? "2" : "1" ) + "_256.png' class='leftbaricon " + ( persistentworld.tokens["MynometerActivated"] !== undefined ? "Has" : "" ) + "' id='MynometerActivated' />";

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
    inquisitor.toggletimeline();
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
        //console.log( "inquisitor: Refuising link to: " + title );
        return false;
    }

    if ( result.title !== '' )
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
        //console.log( "inquisitor: Combination condition found, displaying." );

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

            //console.log( "inquisitor: Adding Child's Parent Description: " + childdescriptioninparent );
            inquisitor.updatedescription( childdescriptioninparentsegment );
        }
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
    if ( result.mutualdirection !== -1 )
    {
        direction = result.mutualdirection;
    }

    if ( !isobject && !isleave )
    {
        //if ( result.mutualdirection === -1 )
        //{
            direction = link.linkdirection;
        //}

        vesselmarkup += " direction='" + direction + "'";
    }

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

        var style = ' ';

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

        titleelement = "<vesseltitle" + style + "class='" + visited + "'>\n" + title + "</vesseltitle>"; //To the " + inttodirection( direction ) + "    border-bottom: 0px solid #333;
        actualtitle = inquisitor.getlocation( id ).name;

        console.log( inquisitor.logic.northvessels );

        $( "#endofnote" ).css( 'margin-bottom', "" + ( 35 + ( inquisitor.logic.northvessels > 0 ? 25 * inquisitor.logic.northvessels : 0 ) ) + 'px' );
        $( customid ).css( 'border-bottom', "1px solid #4a4a4a" );
    }

    $( customid ).append( vesselmarkup + ( usereferencetransition ? " transition='" + referencetransition + "'" : "" ) + " id='" + vesselid + "'>" + actualtitle + "</vessel>" + titleelement );
    $( customid ).find( "#" + vesselid ).addClass( visited ); //attr( 'title', inttodirection( direction ) ).
    inquisitor.crossfadeelement( $( customid ).find( "#" + vesselid ), ( 1 + 1 * inquisitor.logic.trueaddedlinks ) * 1500, 0 )
    inquisitor.render.addedlinks++;
    inquisitor.render.trueaddedlinks++;
}
