Inquisitor.prototype.bulkclassaddition = function( classtoadd )
{
    $( ".notebox" ).addClass( classtoadd );
    $( "#sectionholder" ).addClass( classtoadd );
    $( "#sectionholderrotator" ).addClass( classtoadd );
    $( "#div4" ).addClass( classtoadd );
    $( "#core" ).addClass( classtoadd );
    $( ".headerbox" ).addClass( classtoadd );

    $( "#superlocation" ).addClass( classtoadd );
    $( "#location" ).addClass( classtoadd );
    $( "#dialogue" ).addClass( classtoadd );
    $( "#note" ).addClass( classtoadd );
    $( "#event" ).addClass( classtoadd );
    $( "#seperator" ).addClass( classtoadd );
    $( "#vessels" ).addClass( classtoadd );
    $( "#objects" ).addClass( classtoadd );
    $( "#region" ).addClass( classtoadd );
    $( "#subregion" ).addClass( classtoadd );
    $( "#notenew" ).addClass( classtoadd );
}

Inquisitor.prototype.bulkclassremove = function( classtoremove )
{
    $( ".notebox" ).removeClass( classtoremove );
    $( "#sectionholder" ).removeClass( classtoremove );
    $( "#sectionholderrotator" ).removeClass( classtoremove );
    $( "#div4" ).removeClass( classtoremove );
    $( "#core" ).removeClass( classtoremove );
    $( ".headerbox" ).removeClass( classtoremove );

    $( "#superlocation" ).removeClass( classtoremove );
    $( "#location" ).removeClass( classtoremove );
    $( "#note" ).removeClass( classtoremove );
    $( "#dialogue" ).removeClass( classtoremove );
    $( "#event" ).removeClass( classtoremove );
    $( "#seperator" ).removeClass( classtoremove );
    $( "#vessels" ).removeClass( classtoremove );
    $( "#objects" ).removeClass( classtoremove );
    $( "#region" ).removeClass( classtoremove );
    $( "#subregion" ).removeClass( classtoremove );
    $( "#notenew" ).removeClass( classtoremove );
}

Inquisitor.prototype.processdrawntextsegment = function( type, iscurrent, differenceovertruemax, trueindex, isfirstindex, removefirst, text, index, currentprogress, overridesegmentclass, force, alliscurrent )
{
    if ( true ) //index <= currentprogress || force )
    {
        var segmentclass = ( iscurrent ) ? "unfaded" : "faded";
        if( overridesegmentclass != null && overridesegmentclass != undefined )
        {
            segmentclass = overridesegmentclass;
        }

        var brightness = " style='color: rgba(209,209,209, 1.0);'";// font-size:" + ( iscurrent && !alliscurrent ? 107 : 90 ) + "%;' ";( iscurrent ? 1.0 : 1.0 - differenceovertruemax )

        var finaltextsegment = "<" + type + " class='" + segmentclass + "'" + brightness + "index='" + trueindex + "' id='" + trueindex + "'>"
            + inquisitor.processdescriptiontext( text, !isfirstindex || removefirst, iscurrent && !alliscurrent ) + "</" + type + ">";

        console.log( finaltextsegment );
        return finaltextsegment;
    }
    else
    {
        return "";
    }
}

Inquisitor.prototype.processdescriptiontext = function( descriptiontext, removefirst, isactive )
{
  if ( descriptiontext.trim() === '-' )
  {
      return '<hr class="textbreak">';
  }

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

    var description = descriptiontext;

    //

    /*var splitdescriptionQuote = trimmedtext.split( '"' );
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
    }*/

    //
    //

    var descfirstchar = description.charAt( 0 );
    if ( !removefirst )
    {
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
                description += "</first>";//"<afterfirst>";
            }
        }
        //description += "</afterfirst>";
    }

    description = inquisitor.replacecharacter( description, '"', '<quote>\u2018', '\u2019</quote>' );
    description = inquisitor.replacecharacter( description, '@@', '<notetitle>', '</notetitle>' );
    description = inquisitor.replacecharacter( description, '*', '<emphasis>', '</emphasis>' );
    description = inquisitor.replacecharacter( description, '%', '<inner>', '</inner>' );

    /*if ( true ) //isactive
    {
      var splitsentences = description.split( '.' );
      if ( splitsentences.length > 0 )
      {
          description = "";

          for ( var index = 0; index < splitsentences.length; index++ )
          {
              if( splitsentences[index].trim() !== "" )
              {
                var finalbodytextsegment = splitsentences[index];

                if( splitsentences[index].includes( "@@" ) )
                {
                  index++;
                  finalbodytextsegment += '.' + splitsentences[index];
                }

                if ( descfirstchar === '*' || descfirstchar === '%' )
                {
                  if( index > 0 )
                  {
                    finalbodytextsegment = descfirstchar + finalbodytextsegment;
                  }
                  finalbodytextsegment += '.' + descfirstchar;
                }
                else if( splitsentences.length > 1 && index < splitsentences.length - 1 )
                {
                  finalbodytextsegment += '.';
                }

                description += "<bodytextfade style='animation: fadein " + ( 2 * ( index + 1 ) ) + "s;'>" + finalbodytextsegment + "</bodytextfade>";
              }
          }
      }
    }*/

    //description = "\n\n&#09" + description.trim();
    //console.log( description );

    //description = replacecharacter( description, '�', ' V ', ' V ' );notetitle

    return description;
}

Inquisitor.prototype.replacecharacter = function( text, char, replacementfirst, replacementsecond )
{
    var finaltextsegment = '';

    var starstatus = true, replaceindex = 0, replacedlast = false;

    var splitsentences = text.split( char );
    if ( splitsentences.length > 1 )
    {
      for ( var index = 0; index < splitsentences.length - 1; index++ )
      {
        if ( starstatus )
        {
            finaltextsegment += splitsentences[index] + replacementfirst;
        }
        else
        {
            finaltextsegment += splitsentences[index] + replacementsecond;
        }
        starstatus = !starstatus;
      }

        finaltextsegment += splitsentences[splitsentences.length - 1];
    }
    else
    {
        finaltextsegment += splitsentences[0];
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

Inquisitor.prototype.hexToRgb = function( hex )
{
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
  } : null;
}

Inquisitor.prototype.redrawbackground = function()
{
    //console.log( "inquisitorRender: requesting background change from: " + inquisitor.render.backgroundimageurl + " to: " + inquisitor.render.lastbackground + " ...");
    if ( !( inquisitor.render.backgroundimageurl === '' || inquisitor.render.lastbackground === inquisitor.render.backgroundimageurl ) )
    {
        console.log( "inquisitorRender: Allowing background change from: " + inquisitor.render.backgroundimageurl + " to: " + inquisitor.render.lastbackground );

        $( '#' + inquisitor.render.currentbackgroundbuffer ).fadeOut( 1200 );
        inquisitor.render.currentbackgroundbuffer = ( inquisitor.render.currentbackgroundbuffer === 'backgroundprimary' ? 'backgroundsecondary' : 'backgroundprimary' );

        $( '#' + inquisitor.render.currentbackgroundbuffer ).css( "background-image", "url(img/" + inquisitor.render.backgroundimageurl + ")" );
        $( '#' + inquisitor.render.currentbackgroundbuffer ).fadeIn( 1200 );
        inquisitor.render.lastbackground = inquisitor.render.backgroundimageurl;

        //console.log( inquisitor.render.currentbackgroundbuffer );
    }

    //

    if( inquisitor.render.color !== '' )
    {
      var processedcolor = inquisitor.hexToRgb( inquisitor.render.color );

      console.log( "inquisitorRender: color: " + inquisitor.render.color );

      var highopacitycolor = "rgba("+processedcolor.r+", "+processedcolor.g+", "+processedcolor.b+", "+1.0+")";
      var midopacitycolor  = "rgba("+processedcolor.r+", "+processedcolor.g+", "+processedcolor.b+", "+0.325+")";

      //

      $( '#note' ).css( "border-left-color", midopacitycolor );
      $( 'first' ).css( "color", highopacitycolor );

      $( 'diamond' ).css( "border-top-color", midopacitycolor );
      $( 'diamond' ).css( "border-right-color", midopacitycolor );
      $( 'diamond' ).css( "border-left-color", midopacitycolor );
      $( 'diamond' ).css( "border-bottom-color", midopacitycolor );

      $( '#diamondbackgroundone' ).css( "border-top-color", midopacitycolor );
      $( '#diamondbackgroundone' ).css( "border-right-color", midopacitycolor );
      $( '#diamondbackgroundone' ).css( "border-left-color", midopacitycolor );
      $( '#diamondbackgroundone' ).css( "border-bottom-color", midopacitycolor );
      $( '#diamondbackgroundtwo' ).css( "border-top-color", midopacitycolor );
      $( '#diamondbackgroundtwo' ).css( "border-right-color", midopacitycolor );
      $( '#diamondbackgroundtwo' ).css( "border-left-color", midopacitycolor );
      $( '#diamondbackgroundtwo' ).css( "border-bottom-color", midopacitycolor );

      $( 'diamondradial' ).css( "border-top-color", midopacitycolor );
      $( 'diamondradial' ).css( "border-right-color", midopacitycolor );
      $( 'diamondradial' ).css( "border-left-color", midopacitycolor );
      $( 'diamondradial' ).css( "border-bottom-color", midopacitycolor );
      $( '#location' ).css( "color", highopacitycolor );
      $( 'activesection' ).css( "background-color", highopacitycolor );
      $( 'p.destinations' ).css( "color", highopacitycolor );
    }
}

Inquisitor.prototype.crossfadefix = function( element )
{
  element.css("opacity: 0.9999 !important;");
  console.log( "inquisitorRender: crossfade hack active" );
}

Inquisitor.prototype.crossfadeelement = function( element, currentfadelength, currentfadeoutlength, newhtmlforelement, clearonfade )
{
    element.fadeOut( currentfadeoutlength, function ()
    {
        if ( clearonfade !== undefined && clearonfade !== null )
        {
            inquisitor.begindisplay();
            element.hide().fadeTo( currentfadelength, 0.9999 );
        }
        else
        {
            element.hide().fadeIn( currentfadelength );
        }

        if ( newhtmlforelement !== undefined && newhtmlforelement !== null )
        {
            element.html( newhtmlforelement );
        }
    } );
}

Inquisitor.prototype.processBodyText = function( inputdescriptionsegments, isevent, removefirst, length )
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

        var currentprogress = inquisitor.logic.currentlocationprogress;
        var processeddescriptionsegments = [];
        /*var pagecount = 1, currentpage = 0;
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
        {*/
            //processeddescriptionsegments.push( inputdescriptionsegments );
        //}

        var currentdescriptionsegment = inputdescriptionsegments;//processeddescriptionsegments[currentpage];
        for ( var index = 0; index < currentdescriptionsegment.length; index++ )
        {
            var trueindex = index; //( currentpage * pagelength ) +
            var isfirstindex = index === 0;
            var differencefromcurrent = inquisitor.logic.currentlocationprogress - ( trueindex );
            var differenceovermax     = differencefromcurrent.toFixed();// / pagelength.toFixed();
            var differenceovertruemax = differencefromcurrent.toFixed() / inputdescriptionsegments.length.toFixed();
            var alliscurrent = ( inputdescriptionsegments.length === inquisitor.logic.currentlocationprogress );
            var iscurrent = ( inquisitor.logic.currentlocationprogress === trueindex ) || alliscurrent;

            if( index <= inquisitor.logic.currentlocationprogress )
            {
              if ( currentdescriptionsegment[index].requiresactivation )
              {
                  var allow = inquisitor.testactivationrequirements( index, currentdescriptionsegment );

                  if ( allow )
                  {
                      if ( !persistentworld.activations[persistentworld.store.currentWorldLocationID + ":" + index] )
                      {
                          rawtext += processdrawntextsegment( "activenote", iscurrent, differenceovertruemax, trueindex, isfirstindex, removefirst, currentdescriptionsegment[index].text, index, currentprogress, alliscurrent );
                      }
                      else
                      {
                          var inactiveactivenotetext = '';
                          if ( currentdescriptionsegment[index].additional )
                          {
                              inactiveactivenotetext += currentdescriptionsegment[index].text;
                          }
                          inactiveactivenotetext += currentdescriptionsegment[index].postactivationtext;

                          rawtext += processdrawntextsegment( "activenoteinactive", iscurrent, differenceovertruemax, trueindex, isfirstindex, removefirst, inactiveactivenotetext, index, currentprogress, alliscurrent );
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
                      //console.log( "inquisitor: Attempting inline link creation: " + linklocationid );

                      var origin = persistentworld.store.currentWorldLocationID;
                      if ( currentdescriptionsegment[index].overrideorigin )
                      {
                          origin = currentdescriptionsegment[index].origin;
                          //console.log( "inquisitor: Origin overriden: " + origin );
                      }

                      var result = inquisitor.cantraverse( origin, linklocationid, link, true, currentdescriptionsegment[index].ignorestate );
                      if ( !result.success )
                      {
                          //console.log( "inquisitor: Failed link to: " + destination );
                      }
                      else
                      {
                          linkfailed = false;

                          var conceptuallink = currentdescriptionsegment[index].conceptuallink;
                          var isconceptuallink = !( conceptuallink === null || conceptuallink === undefined );

                          var segmentclass = ( !( persistentworld.time.locationtime[linklocationid] === null || persistentworld.time.locationtime[linklocationid] === undefined ) ? 'visited' : 'unvisited' );
                          var finaltextsegment = "inlinelink id='" + trueindex + "' data='" + ( isconceptuallink ? linklocationid : linklocationid ) + ( isconceptuallink ? "' conceptual='" + isconceptuallink : "" ) + "' ";

                          rawtext += inquisitor.processdrawntextsegment( finaltextsegment, iscurrent, differenceovertruemax, trueindex, isfirstindex, removefirst, ( isconceptuallink ? "" : "" ) + currentdescriptionsegment[index].text, index, currentprogress, null, true, alliscurrent );
                      }
                  }

                  if ( linkfailed )
                  {
                      console.log( currentdescriptionsegment[index].text );
                      rawtext += inquisitor.processdrawntextsegment( "inactivenote", iscurrent, differenceovertruemax, trueindex, isfirstindex, removefirst, currentdescriptionsegment[index].text, index, currentprogress, segmentclass, currentdescriptionsegment[index].force, alliscurrent );
                  }
              }
           }
        }
    }

    //

    tryachivement( inquisitor.getlocation(persistentworld.store.currentWorldLocationID).achievementname );

    //

    console.log( rawtext );

    return rawtext;
}

Inquisitor.prototype.updatedescription = function( additionalsegment )
{
    var descriptionlocation = inquisitor.getlocation( persistentworld.store.currentWorldLocationID );
    var descsegments = descriptionlocation.descriptionsegments;

    //

    if ( descriptionlocation.hasconcepts )
    {
        var currentconcept = inquisitor.getlocation( persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID] );
        //console.log( currentconcept );

        var conceptdescription = currentconcept.descriptionsegments;
        descsegments = conceptdescription;

        if( inquisitor.logic.currentconceptprogress < descsegments )
        {
            inquisitor.logic.currentconceptprogress++;
            //persistentworld.world.locationcurrentconcept[persistentworld.store.currentWorldLocationID]++;
        }
        else if ( !inquisitor.logic.conceptlinksdisplayed )
        {
            inquisitor.displayconceptlinks( currentconcept, descsegments );
        }

        //indialogue = true;
    }
    else
    {
        inquisitor.logic.conceptsover = true;
        //indialogue = false;
    }

    //

    if ( additionalsegment !== null && additionalsegment !== undefined )
    {
        //console.log( "Inquisitor: Additional segment found : " + additionalsegment.text );
        descsegments.push( additionalsegment );
    }

    if ( descsegments.length === 0 )
    {
        return descsegments;
    }

    if ( persistentworld.world.state === 'linearinterface' || persistentworld.world.state === 'linear' || descriptionlocation.hasconcepts )
    {
        //processeddialogue = '<linearlayout>' + processeddialogue + '</linearlayout>';
        inquisitor.bulkclassaddition( 'linearlayout' );
    }
    else
    {
        inquisitor.bulkclassremove( 'linearlayout' );
    }

    if( inquisitor.logic.indialogue )
    {
        inquisitor.bulkclassaddition( 'dialoguelayout' );
    }
    else
    {
        inquisitor.bulkclassremove( 'dialoguelayout' );
    }

    if ( !inquisitor.logic.indialogue )
    {
        $( "#note" ).html( inquisitor.processBodyText( descsegments ) );
    }

    inquisitor.crossfadeelement( $( "#note" ).find( "#" + inquisitor.logic.currentlocationprogress ), 250 + inquisitor.calculatereadingtime( descsegments[descsegments.length - 1].text ) / 20, 0 );

    if ( additionalsegment !== null && additionalsegment !== undefined )
    {
        descsegments.pop();
    }

    return descsegments;
}

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
                                                $(window).scrollLeft()) + "px");
    return this;
}

Inquisitor.prototype.findcenter = function( element )
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

Inquisitor.prototype.toggletimeline = function( )
{
    //viewingtimeline = !viewingtimeline;
    $( '#core' ).show();

    //console.log("inquisitorRender: requested rendering timeline, status: " + inquisitor.logic.viewingtimeline );

    if ( inquisitor.logic.viewingtimeline )
    {
        $( '#events-content' ).hide();
        $.smoothScroll( {
            scrollElement: $( '.content' ),
            speed: 600,
            easing: 'swing',
            offset: inquisitor.findcenter( '#notebox' ) + ( !( persistentworld.world.state === 'linear' || persistentworld.world.state === 'linearinterface' ) ? 100 : 0 )
        } );

        inquisitor.render.backgroundimageurl = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).backgroundimage;
    }
    else
    {
        $( '#events-content' ).fadeIn( 700 );
        $.smoothScroll( {
            scrollElement: $( '.content' ),
            speed: 600,
            easing: 'swing',
            offset: inquisitor.findcenter( '#timeline' )
        } );
        $.smoothScroll( {
            scrollElement: $( '.content' ),
            speed: 600,
            easing: 'swing',
            offset: inquisitor.findcenter( '.selected' ),
        } );

        inquisitor.render.backgroundimageurl = inquisitor.render.backgroundimageurltimeline;
    }

    inquisitor.redrawbackground();

    $( "#dialogue" ).hide();
    $( "#dialoguefader1" ).hide();
    $( "#dialoguefader2" ).hide();
    $( "#dialoguedivider1" ).hide();
    $( "#dialoguedivider2" ).hide();

    //$( "#exitprompt" ).html( "viewingtimeline: " + viewingtimeline );
}

Inquisitor.prototype.toggleExpand = function()
{
    inquisitor.render.expanddescription = !inquisitor.render.expanddescription;

    var newmaxheight = inquisitor.render.expanddescription ? '600px' : '400px';

    //$( "#note" ).animate( { 'max-height': newmaxheight }, 700, function () { } );
}

Inquisitor.prototype.moveBackground = function( event )
{
    //console.log("inquisitorRender: moveBackground()");

    var halfWindowH = $( window ).height() * 2.0,
        halfWindowW = $( window ).width() * 2.0;

    var correctedx = ( event.screenX - halfWindowW ) * ( $( window ).height() / $( window ).width() );
    var correctedy = ( event.screenY - halfWindowH );

    var rotateY = ( ( correctedx - inquisitor.render.lastmousepagex ) ),
        rotateX = ( ( correctedy - inquisitor.render.lastmousepagey ) );

    inquisitor.render.lastmousepagex = correctedx;
    inquisitor.render.lastmousepagey = correctedy;

    mousevelocityvertical += rotateY * 0.25;
    mousevelocityhorizontal += rotateX * 0.25;

    //mousevelocityhorizontal = Math.round( mousevelocityhorizontal );
    //mousevelocityvertical   = Math.round( mousevelocityvertical );

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

    //console.log("inquisitorRender: " + 'translateY(' + mousevelocityhorizontal + 'px' + ') translateX(' + mousevelocityvertical + 'px' + ') translateZ(0)');
}

Inquisitor.prototype.displayconceptlinks = function( concept, descriptionsegments, conceptid )
{
    var conceptlinks = inquisitor.processlinkadditions( concept.id );
    //console.log( conceptlinks );

    for ( var index in conceptlinks )
    {
        var newdescriptionsegment = { text: conceptlinks[index].initiatinglink.title, requiresactivation: false, active: true, postactivationtext: '', islink: true }
        newdescriptionsegment.storedlink = conceptlinks[index].initiatinglink;
        newdescriptionsegment.hasstoredlink = true;
        newdescriptionsegment.origin = concept.id;
        newdescriptionsegment.overrideorigin = true;
        newdescriptionsegment.ignorestate = true;
        newdescriptionsegment.conceptuallink = true;
        descriptionsegments.push( newdescriptionsegment );
    }

    inquisitor.logic.conceptlinksdisplayed = true;
    inquisitor.logic.conceptsover = ( conceptlinks.length === 0 );
}

Inquisitor.prototype.displayvessels = function()
{
    var vesselsadded = {};

    inquisitor.render.northvessels = 0;
    inquisitor.render.southvessels = 0;
    inquisitor.render.eastvessels  = 0;
    inquisitor.render.westvessels = 0;

    var siblingresults = inquisitor.enumeratesiblings( persistentworld.store.currentWorldLocationID );
    var siblings = siblingresults.siblingsfound;

    for ( var index in siblings )
    {
        var siblingname = inquisitor.getlocation( siblings[index] ).name;
        //addvessel( siblings[index], siblingname, false );
        //console.log( "Inquisitor: Attempting to link to sibling, " + siblingname );
    }

    //

    inquisitor.render.finaldescriptionsegments = inquisitor.getlocation(persistentworld.store.currentWorldLocationID).descriptionsegments.slice();

    var children = inquisitor.enumeratechildren( persistentworld.store.currentWorldLocationID );
    //console.log( children );
    for ( var index in children )
    {
        var isobject = inquisitor.getlocation( children[index] ).isobject;
        if ( isobject )
        {
            //console.log( "Inquisitor: Attempting to link to child, " + children[index] );
            inquisitor.addvessel( children[index], inquisitor.getlocation( children[index] ).name, true, null, null, null, '#objects' );
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

    if ( inquisitor.logic.addedlinks > 0 )
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
        var referencetransition = availableadditions[index].initiatinglink.transition;

        //console.log( referencetransition );
        //console.log( referencename );

        var allowaddition = false;
        for ( var indextwo in availableadditions )
        {
          if( index !== indextwo )
          {
            if( availableadditions[index] === availableadditions[indextwo] )
            {
              allowaddition = true;
            }
          }
        }

        if( !allowaddition )
        {
          inquisitor.addvessel( availableadditions[index].index, availableadditions[index].title, true, availableadditions[index].initiatinglink.token,
                  availableadditions[index].initiatinglink.action, availableadditions[index].initiatinglink, null, referencetransition );
              vesselsadded[referenceid] = ( { index: referenceid, priority: !( referencename === referencetitle ) } );
        }
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
                //console.log( allow );
            }

            if ( allow && !firstadditionfound && ( referencename === referencetitle ) )
            {
                referencetitle = inquisitor.findpreviousreferencetitle( referenceid );
            }

            if ( allow && references[index].allowmutual )
            {
                inquisitor.addvessel( referenceid, referencetitle, true );
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
            //console.log( "inquisitor: Leaving to first child of parent: " + leaveid );
        }
        else
        {
            //console.log( "inquisitor: Leaving to parent: " + leaveid );
        }

        if ( persistentworld.store.currentWorldLocationID === 0 )
        {
            leaveid = 1;
            leavemessage = "Enter";
            //console.log( inquisitor.world );
        }

        //console.log( "inquisitor: Leave goes to: " + leaveid );

        if ( leaveid > -1 )
        {
            inquisitor.addvessel( leaveid, leavemessage, true );
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

    if ( ( inquisitor.logic.eastvessels + inquisitor.logic.northvessels + inquisitor.logic.westvessels + inquisitor.logic.southvessels ) > 0 )
    {
        $( "#diamond" ).show();
        $( ".diamondradial" ).show();
        //$( "#diamond" ).fadeIn( 500 );
       // $( ".diamondradial" ).fadeIn( 500 );
    }
    else
    {
        $( "#diamond" ).hide();
        $( ".diamondradial" ).hide();
    }

}
