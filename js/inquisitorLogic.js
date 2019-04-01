Inquisitor.prototype.calculatereadingtime = function( texttoread )
{
    var CPM = 1150.0;
    var texttoreadnowhitespace = texttoread.trim();
    var characterlength = texttoreadnowhitespace.length.toFixed();

    return Math.floor( ( characterlength / CPM ) * 600.0 ) * 100;
}

Inquisitor.prototype.cantraverse = function ( startlocationindex, targetlocationindex, initiatinglink, forcelink, ignorestate )
{
    var result = {};
    //result.mutual = false;
    //result.mutualdirection = -1;
    result.title = "";
    result.combinationconditional = false;
    result.success = false;

    //var mutuallink = inquisitor.tryfindmutuallink( targetlocationindex, inquisitor.world.rawlocations[startlocationindex] );
    //var allowmutual = true;
    /*if ( mutuallink !== undefined && mutuallink !== null )
    {
        if ( initiatinglink !== undefined && initiatinglink !== null )
        {
          allowmutual = ( initiatinglink.allowmutual );
        }

        if( allowmutual && ( mutuallink.allowmutual ) )
        {
          result.mutual = true;
          result.mutualdirection = inquisitor.intdirectioninvert( mutuallink.linkdirection );
          console.log( "inquisitor: Found mutual link from: " + inquisitor.world.rawlocations[targetlocationindex].name + ". Direction: " + inquisitor.inttodirection( result.mutualdirection ) );
        }
    }

    if( inquisitor.world.rawlocations[targetlocationindex].parentid == startlocationindex )
    {
      result.mutualdirection = inquisitor.world.rawlocations[targetlocationindex].parentdirection;
    }*/

    if ( initiatinglink !== undefined && initiatinglink !== null )
    {
        if ( initiatinglink.hasconditional )
        {
            var hastoken = !( persistentworld.tokens[initiatinglink.conditional] === undefined || persistentworld.tokens[initiatinglink.conditional] === null );
            if ( !hastoken && !initiatinglink.exclusionconditional )
            {
                if ( initiatinglink.combinationcondition )
                {
                    result.combinationconditional = true;
                }
                else
                {
                    //console.log( "inquisitor: Condition: " + initiatinglink.conditional + ". Not met" );
                    return result;
                }
            }
            if ( hastoken && initiatinglink.exclusionconditional )
            {
                console.log( "inquisitor: Exclusion Condition: " + initiatinglink.conditional + ". Met" );
                return result;
            }
        }

        result.title = initiatinglink.title;
    }
    else if ( !forcelink ) // && !result.mutual
    {
        console.log( "inquisitor: Link not requested" );
        return result;
    }

    if( persistentworld.world.locationhidden[targetlocationindex] === undefined 
     || persistentworld.world.locationhidden[targetlocationindex] === null )
    {
        persistentworld.world.locationhidden[targetlocationindex] = false;
    }
    else if ( persistentworld.world.locationhidden[targetlocationindex] === true )
    {
        console.log( "inquisitor: Link hidden." );
        return result;
    }

    var targetstate = inquisitor.world.rawlocations[targetlocationindex].state.trim();
    var currentstate = persistentworld.world.state.trim();

    var doforce = false;

    if( initiatinglink !== undefined && initiatinglink !== null )
    {
      doforce = initiatinglink.force;
    }

    if ( targetstate !== currentstate && !ignorestate && !doforce )
    {
        console.log( "inquisitor: attempting state change. From: " + currentstate + " to: " + targetstate );
        if ( currentstate == 'world' )
        {
            console.log( "inquisitor: state transversal denied." );
            return result;
        }
    }

    result.success = true;
    return result;
}


Inquisitor.prototype.testactivationrequirements = function( requiredtokens )
{
    inquisitor.log( 0, "Testing activation results." );

    var allow = false;
    for ( var tokenindex = 0; tokenindex < requiredtokens.length; tokenindex++ )
    {
        inquisitor.log( 0, "Testing for required token: " + requiredtokens[tokenindex].token );

        var requiredtoken = requiredtokens[tokenindex].token;
        var requiredtokeninversion = requiredtokens[tokenindex].requireinversion;
        var requiredtokenexists = 
            ( persistentworld.tokens[requiredtoken] !== undefined 
           && persistentworld.tokens[requiredtoken] !== null );

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

Inquisitor.prototype.updatedirector = function()
{
  var rules = inquisitor.world.rulebuffer;
  //console.log( rules );

  for ( var index in rules )
  {
      if( persistentworld.rulestriggered[index] )
      {
        continue;
      }

      var firstvalue, secondvalue = -1;
      if( parseInt( rules[index].conditionfirstvalue ) >= 0 )
      {
        firstvalue = parseInt( rules[index].conditionfirstvalue );
      }
      else
      {
        firstvalue = persistentworld.tokens[rules[index].conditionfirstvalue];
      }

      if( parseInt( rules[index].conditionsecondvalue ) >= 0 )
      {
        secondvalue = parseInt( rules[index].conditionsecondvalue );
      }
      else
      {
        secondvalue = persistentworld.tokens[rules[index].conditionsecondvalue];
      }

      //

      var conditionsuccess = false;
      switch( rules[index].conditiontype )
      {
        case '>':
          conditionsuccess = firstvalue > secondvalue;
          break;
        case '<':
          conditionsuccess = firstvalue < secondvalue;
          break;
        case '=':
          conditionsuccess = firstvalue == secondvalue;
          break;
        default:
      }

      if( conditionsuccess )
      {
        if( rules[index].effecttype === 'travel' )
        {
          inquisitor.logic.lastlastWorldLocationID = inquisitor.logic.lastWorldLocationID;
          persistentworld.store.lastWorldLocationID = persistentworld.store.currentWorldLocationID;
          persistentworld.store.currentWorldLocationID = inquisitor.findlocationbytitle( rules[index].effectparameter, persistentworld.store.currentWorldLocationID );

          persistentworld.rulestriggered[index] = true;
        }
      }

      console.log( "inquisitorLogic: conditionfirstvalue: " + firstvalue + ", conditionsecondvalue: " + secondvalue + ", success: " + conditionsuccess );
  }
}

Inquisitor.prototype.updatetime = function( forcetraverse, noprogress )
{
    persistentworld.tokens["_progress"] = persistentworld.lys.vialcount;
    persistentworld.tokens["_random"]   = Math.floor( Math.random() * 100 );

    inquisitor.updatedirector();

    //

    inquisitor.logic.currentlocationprogress = persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID]
            ? inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments.length - 1
            : inquisitor.logic.currentlocationprogress;

    //
    
    if( !noprogress )
    {
        persistentworld.time.globaltime++;
    }

    if ( persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID] === undefined || persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID] === null )
    {
        persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID] = 0;
    }
    else if( !noprogress )
    {
        persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID]++;
    }

    //console.log( "Inquisitor: Global time now at : " + persistentworld.time.globaltime + ". Local time now at : " + persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID] );

    inquisitor.updateentities();

    if ( !timelinebegun )
    {
        inquisitor.updatetimeline();
    }

    //

    inquisitor.drawicons();

    var traverseoncompletion = false;

    //console.log( 'inquisitor: state is ' + persistentworld.world.state );

    //

    /*currenteventactive = !currenteventactive;
    console.log( "inquisitor: Event Prompt Clicked." );
    redraw();*/

    if( !noprogress )
    {
        var skip = true;
        var readtime = -1;
        var previousreadtime = -1;

        inquisitor.logic.currentlocationprogress++;

        while( skip 
            && inquisitor.logic.currentlocationprogress < 
            inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments.length )
        {
            skip = false;

            var loca     = inquisitor.getlocation( persistentworld.store.currentWorldLocationID )
                .descriptionsegments[inquisitor.logic.currentlocationprogress];
            var locanext = inquisitor.getlocation( persistentworld.store.currentWorldLocationID )
                .descriptionsegments[inquisitor.logic.currentlocationprogress+1];
        
            if ( loca     != null && loca     != undefined 
              && locanext != null && locanext != undefined )
            {
                readtime = inquisitor.calculatereadingtime( locanext.text );

                var locatexttrim = loca.text.trim();
                if( readtime < 750
                || locatexttrim.charAt( locatexttrim.length - 1 ) !== '.' )
                {
                    console.log( locatexttrim.charAt( locatexttrim.length - 1 ) );
                    skip = true;
                    inquisitor.logic.currentlocationprogress++;
                }
            }
        }
    }

    $( "#notecontinue" ).hide();

    var ourheight = 10000;
    var ourtime = 1500;
    var doshow = persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID];

    if ( inquisitor.logic.currentlocationprogress < 
         inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments.length 
      || inquisitor.logic.currenteventactive )
    {
        $( "#notecontinue" ).show();
        $( "#notecontinue" ).html("...");
        //inquisitor.crossfadeelement( $( "#notecontinue" ), 1500, 0, "\n..." );
        $( "#endofnote" ).hide();
    }
    else
    {
        doshow = true;
    }

    if ( ( persistentworld.world.state === 'linear' || persistentworld.world.state === 'linearinterface' ) ) //&& dialoguecount > 1
    {
        var sectionholderhtml = '';
        var segmentcount = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments.length;
        var alreadyactivated = false;
        var hasbreak = false;

          for ( var segmentindex = segmentcount - 1; segmentindex > 0; segmentindex-- )
          {
              if ( inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments[segmentindex].isbreak || ( segmentindex === 1 ) )
              {
                  if( inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).descriptionsegments[segmentindex].isbreak && !hasbreak )
                  {
                    hasbreak = true;
                  }

                  var allowactivation = inquisitor.logic.currentlocationprogress >= inquisitor.logic.dialogueindex && !alreadyactivated;
                  if ( allowactivation )
                  {
                      alreadyactivated = true;
                  }
                  sectionholderhtml = "<h3 id='section" + segmentindex + "'" + ( allowactivation ? " class='activesection'" : '' ) + "></h3>" + sectionholderhtml;
              }
        }

        if( hasbreak )
        {
          $( "#sectionholderrotator" ).html( sectionholderhtml );
        }
    }

    if ( persistentworld.world.state !== 'stateless'       && persistentworld.world.state !== 'linear' 
      && persistentworld.world.state !== 'linearinterface' && !inquisitor.logic.indialogue )
    {
        if ( doshow && inquisitor.logic.conceptsover && !persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] )
        {
            persistentworld.lys.currentlys += 20;
            if ( persistentworld.lys.currentlys > 100 )
            {
                persistentworld.lys.vialcount++;
                persistentworld.lys.currentlys = 0;
            }
        }

        //console.log( "Lys state. vialcount: " + persistentworld.lys.vialcount + " lyscount: " + persistentworld.lys.currentlys );

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
        $( "#diamondcontainer" ).removeClass( "alwaysHide" );

        if( persistentworld.world.state === 'world' )
        {
            $( "#lysdiamondouter" ).addClass( "alwaysHide" );
            $( "#lysdiamond" ).addClass( "alwaysHide" );
            $( "#lyscounter" ).addClass( "alwaysHide" );
        }
    }
    else
    {
        $( "#lyscontainer" ).addClass( "alwaysHide" );
        $( "#lysdiamondouter" ).addClass( "alwaysHide" );
        $( "#lysdiamond" ).addClass( "alwaysHide" );
        $( "#lyscounter" ).addClass( "alwaysHide" );
        $( "#diamondcontainer" ).addClass( "alwaysHide" );
    }

    //

    inquisitor.updatedialogue();

    var descsegments = inquisitor.updatedescription();

    //

    if ( doshow && inquisitor.logic.conceptsover && !inquisitor.logic.indialogue )
    {
        inquisitor.toggleExpand();
        persistentworld.world.locationvisited[persistentworld.store.currentWorldLocationID] = true;

        //

        //$( "#eventprompt" ).hide();

        if ( inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).eventid != -1 )
        {
            var eventid = inquisitor.getlocation(persistentworld.store.currentWorldLocationID).eventid;
            var rawevent = inquisitor.world.rawevents[eventid];
            if ( rawevent.text !== '' )
            {
                var allowevent = ( rawevent.condition === '' );
    
                if ( rawevent.timedcondition !== -1 )
                {
                    allowevent = rawevent.timedconditionislocal ? ( rawevent.timedcondition <= persistentworld.time.locationtime[persistentworld.store.currentWorldLocationID] ) : ( rawevent.timedcondition <= persistentworld.time.globaltime );
                    inquisitor.log( 1, "Found timed condition, requiring: " + rawevent.timedcondition, "Event" );
                }
                else if ( rawevent.condition !== '' )
                {
                    allowevent = !( persistentworld.tokens[rawevent.condition] === undefined || persistentworld.tokens[rawevent.condition] === null );
                    inquisitor.log( 1, "Found standard condition.", "Event" );
                }
    
                inquisitor.log( 1, "inquisitor: Allowing? " + allowevent, "Event" );
    
                if ( allowevent && !inquisitor.logic.indialogue )
                {
                    var lengthtest = 200;
                    while ( true )
                    {
                        var rawnewtext = inquisitor.processBodyText( rawevent.descriptionsegments, true, 
                            false, inquisitor.logic.currenteventactive ? 50000 : lengthtest ) + "\n";
    
                            //? "<img src='img/item/TBIM_ITEM_Myno_512.png' id='eventmynobackground' /><img src='img/TBIM_DECO_Twirl_1024x64.png' class='eventdeco' id='eventdeco2' />\n\n\n\n<div id='prompttext'>Continue?<div/>"
                            //: "<p id='eventfader' class='eventfader' /><img src='img/item/TBIM_ITEM_Myno_512.png' id='eventprompt' />"
                            //+ "<div id='prompttext'>Activate Memory?<div/>";
                        
                            var newtext = ''
                           // + ( inquisitor.logic.currenteventactive ? "<p id='eventexclusionfader1' class='eventexclusionfader' />" : "" ) 
                            + "<div class='event" + ( inquisitor.logic.currenteventactive ? "active" : "inactive" ) 
                            + "'>";
                            
                            if( !inquisitor.logic.currenteventactive ) 
                            {
                                newtext += "<div id='inactiveeventtext'>" + rawnewtext 
                                    + "<img src='img/item/TBIM_ITEM_Myno_512.png' id='eventmynobackground' /></div></div><div id='prompttext'>Activate Memory?</div>"; //<img src='img/item/TBIM_ITEM_Myno_512.png' id='eventmynobackground' />
                                //$( "#note" ).show();
                                $( "#event" ).html( newtext ).hide().fadeIn( 1000 );
                                //inquisitor.crossfadeelement( $( "#event" ), 1500, 0, newtext );
                                inquisitor.bulkclassremove( 'linearlayout' );
                            }
                            else
                            {
                                newtext = rawnewtext;
                                $( "#note" ).html( newtext );
                                //$( "#note" ).fadeIn( 500, function() { $( "#note" ).html( newtext ); } );
                                inquisitor.bulkclassaddition( 'linearlayout' );
                            }
                            
                            //+ ( inquisitor.logic.currenteventactive ? "<p id='eventexclusionfader2' class='eventexclusionfader' />" : "" );
                        //<img src='img/TBIM_DECO_Footer_1024x64.png' class='eventdeco' id='eventdeco1' />
    
                        if ( $( "#event" ).innerHeight() < 200 || inquisitor.logic.currenteventactive )
                            break;
                        lengthtest--;
                    }
    
                    //$( "#eventprompt" ).show();
    
                    if( rawevent.givetoken != '' )
                    {
                        persistentworld.tokens[rawevent.givetoken] = persistentworld.store.currentWorldLocationID;
                    }
    
                    //
    
                    if ( inquisitor.logic.currenteventactive )
                    {
                        tryachivement( rawevent.achievementname );
    
                        if ( rawevent.soundurl != '' && !persistentworld.soundmuted )
                        {
                            inquisitor.audio.playingpriority = true;
                            inquisitor.audio.priority = new buzz.sound( rawevent.soundurl.trim(), {
                                formats: ["ogg", "mp3", "wav"]
                            } );
                            inquisitor.audio.priority.load();
    
                            //inquisitor.log( 1, "Playing sound: " + rawdialogue.soundurl, "Event" );
                        }
                    }
    
                    //
                }
            }
        }

        //

        if( !inquisitor.logic.currenteventactive )
        {
            showingvessels = true;
            inquisitor.displayvessels();
            //inquisitor.crossfadeelement( $( "#notecontinue" ), 1500, 0, "" );
            $( "#endofnote" ).fadeIn( 500 );
    
            if ( persistentworld.world.state === 'linear' )
            {
                traverseoncompletion = false;
    
                var locationtoreturn = persistentworld.store.lastWorldLocationID;
                persistentworld.store.lastWorldLocationID = persistentworld.store.currentWorldLocationID;
                persistentworld.store.currentWorldLocationID = locationtoreturn;
    
                redraw();
            }
        }

        //$( "#note" ).stop();
        //$( "#note" ).animate( { scrollTop: ourheight }, ourtime );
    }
    else if ( !inquisitor.render.expanddescription )
    {
        inquisitor.toggleExpand();
    }

    if( traverseoncompletion || forcetraverse )
    {
        persistentworld.store.lastWorldLocationID = persistentworld.store.currentWorldLocationID;
        persistentworld.store.currentWorldLocationID = inquisitor.traverselinearlocation();

        redraw();
    }

    inquisitor.render.backgroundimageurl = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).backgroundimage;
    inquisitor.render.backgroundopacity  = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).backgroundopacity;
    inquisitor.render.color = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).color;

    $.smoothScroll( {
        scrollElement: $( '#div4' ),
        speed: 4000,
        easing: 'swing',
        offset: $( '#note' ).get(0).scrollHeight, //$( '#note' ).height
    } );

    //console.log( $( '#note' ).height() );

    $( "#debug" ).html( inquisitor.render.log );
    $.smoothScroll( {
        scrollElement: $( '#debug' ),
        speed: 4000,
        easing: 'swing',
        offset: $( '#debug' ).get(0).scrollHeight, //$( '#note' ).height
    } );

    inquisitor.drawcontent();

    console.log( inquisitor );
}
