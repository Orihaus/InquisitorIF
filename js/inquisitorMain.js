function Inquisitor( )
{
    this.logic = {
      combinationstore: {},
      indialogue: false,
      currenteventactive: false,
      viewingtimeline: false,

      escapekeyheldfor: 0,

      lastlastWorldLocationID: 0,
      lastWorldLocationID: 0,

      trueaddedlinks: 0,
      addedlinks: 0,
      northvessels: 0,
      southvessels: 0,
      eastvessels: 0,
      westvessels: 0,

      savedlocation: -1,
      isincredits: false,
      conceptlinksdisplayed: false,
      conceptsover: false,
      currentlocationprogress: 0,
      currentconceptprogress: 0,
      istransitioning: false
    };

    this.audio = {
        playingpriority: false,
        delaybegun: false,
        delayover: false
    }

    this.render = {
      zoom: 1.0,
      scrolling: false,
      showingconsole: false,
      finaldescriptionsegments: {},
      expanddescription: true,
      lastmousepagex: 0,
      lastmousepagey: 0,
      backgroundimageurltimeline: '',
      backgroundimageurl: '',
      backgroundopacity: 1.0,
      color: "#a69471",
      currentbackgroundbuffer: "backgroundprimary",
      timelineeventsadded: 0,
      truetimelineeventsadded: 0,
      showingvessels: false,
      lastbackground: '',
      log: ""
    };
};
var inquisitor = new Inquisitor();

Inquisitor.prototype.initialize = function ( url, callback )
{
    inquisitor.callback = callback;
    inquisitor.url = url;
    inquisitor.parse( inquisitor.url, inquisitor.finishedParsing );
}

Inquisitor.prototype.finishedParsing = function ( result )
{
    inquisitor.world = result;

    inquisitor.rebuildregions();
    inquisitor.rebuildentities( persistentworld.entity.locations );
    //inquisitor.callback();
    inquisitor.loadpersistent();
    inquisitor.initializeInteraction();

    inquisitor.render.color = inquisitor.getlocation( persistentworld.store.currentWorldLocationID ).color;

    //

    inquisitor.updateambientaudio();

    //

    inquisitor.begindisplay();
    //inquisitor.displayworld();
}

Inquisitor.prototype.updatezoom = function ( loop )
{
    inquisitor.render.zoom = $(document).height() / 1080;
    $( "#main" ).css('zoom', inquisitor.render.zoom );

    if( true )
    {
        setTimeout( function ()
        {
            inquisitor.updatezoom();
        }, 50 );
    }
}

Inquisitor.prototype.updatecentering = function ( loop )
{
    var scrollto = inquisitor.logic.viewingtimeline ? '#timeline' : '#core';

    var zoomoffset = 1080 - $( scrollto ).innerHeight();
    var center = $( scrollto ).offset().top;//inquisitor.findcenter( '#note' );
    //inquisitor.log( 0, "zo: " + zoomoffset );
    //inquisitor.log( 0, "center: " + center );

    var computedoffset = center - zoomoffset / 2;
    var changed = ( $( scrollto ).scrollTop() != computedoffset );
    if( changed && !inquisitor.render.scrolling )
    {
        inquisitor.render.scrolling = true;
        $.smoothScroll( {
            scrollElement: $( '.content' ),
            speed: 700,
            easing: 'swing',
            offset: computedoffset * inquisitor.render.zoom
        } );

        setTimeout( function ()
        {
            inquisitor.render.scrolling = false;
        }, 700 );
    }

    if( true )
    {
        setTimeout( function ()
        {
            inquisitor.updatecentering();
        }, 50 );
    }
}

Inquisitor.prototype.updateambientaudio = function ()
{
    //inquisitor.log( 0, "Audio Update" );

    //

    if( inquisitor.audio.playingpriority )
    {
        if( persistentworld.soundmuted && inquisitor.audio.playingpriority )
        {
            inquisitor.audio.priority.fadeOut( 1000, function () {
                this.stop();
            });

            inquisitor.audio.playingpriority = false;
        }

        if( !inquisitor.audio.delaybegun )
        {
            setTimeout( function ()
            {
                inquisitor.audio.delayover = true;
                inquisitor.audio.priority.play();

                inquisitor.log( 0, "Priority Audio Began." );
            }, 1100 );
            inquisitor.audio.delaybegun = true;
        }

        if( inquisitor.audio.delayover && inquisitor.audio.delaybegun )
        {
            if( inquisitor.audio.priority.isEnded() )
            {
                inquisitor.audio.playingpriority = false;
                inquisitor.audio.delayover = false;
                inquisitor.audio.delaybegun = false;

                inquisitor.log( 0, "Priority Audio Complete." );
            }
        }
    }

    //

    for ( var id in inquisitor.world.audios )
    {
        if( !inquisitor.world.audios[id].loop )
        {
            if( inquisitor.world.audios[id].firstbuffer.isEnded() && inquisitor.world.audios[id].playing )
            {
                inquisitor.world.audios[id].playing = false;
                inquisitor.log( 0, "Completed Audio: " + inquisitor.world.audios[id].name );
            }
        }

        if( persistentworld.soundmuted || inquisitor.audio.playingpriority )
        {
            if( inquisitor.world.audios[id].playing )
            {
                inquisitor.world.audios[id].firstbuffer.fadeOut( 1000, function () {
                    this.stop();
                });
                inquisitor.world.audios[id].secondbuffer.fadeOut( 1000, function () {
                    this.stop();
                });

                inquisitor.world.audios[id].playing = false;
            }
        }
        else
        {
            var allow = !inquisitor.world.audios[id].playing 
                      && inquisitor.world.audios[id].probablility > Math.random();
            if( allow )
            {
                for ( var ruleid in inquisitor.world.audios[id].rules )
                {
                    inquisitor.log( 0, "Testing Audio Rule: " + inquisitor.world.audios[id].rules[ruleid].token );
                    var requiredtoken = inquisitor.world.audios[id].rules[ruleid].token;
                    var allowrule = 
                        ( persistentworld.tokens[requiredtoken] !== undefined 
                        && persistentworld.tokens[requiredtoken] !== null );
                    if ( inquisitor.world.audios[id].rules[ruleid].exclusive )
                    {
                        allowrule = !allowrule;
                    }

                    if( !allowrule )
                    {
                        allow = false;
                    }

                    //inquisitor.log( 0, "Allowing Audio Rule: " + allow );
                }
            }

            if( allow )
            {
                inquisitor.world.audios[id].playing = true;

                //inquisitor.world.audios[id].sound.bind("ended", function () {
                    //inquisitor.world.audios[id].playing = false;
                    //inquisitor.log( 0, "Finished Audio: " + inquisitor.world.audios[id].name );
                //});

                if( !inquisitor.world.audios[id].loop )
                {
                    inquisitor.world.audios[id].firstbuffer.play();
                }
                else
                {
                    var selectedbuffer   = inquisitor.world.audios[id].usefirstbuffer 
                        ? inquisitor.world.audios[id].firstbuffer
                        : inquisitor.world.audios[id].secondbuffer;
                    selectedbuffer.play();
                }

                inquisitor.log( 0, "Playing Audio: " + inquisitor.world.audios[id].name );
            }
           // inquisitor.log( 0, "Audio: " + inquisitor.world.audios[id].name );

            //

            if( inquisitor.world.audios[id].playing )
            {
                if( !inquisitor.world.audios[id].loop )
                {
                    if( inquisitor.world.audios[id].firstbuffer.getPercent() > 0 )
                    {
                        inquisitor.world.audios[id].targetvolume = 
                            lerp( inquisitor.world.audios[id].startvolume,
                                inquisitor.world.audios[id].endvolume,
                                inquisitor.world.audios[id].firstbuffer.getPercent() / 100.0 );
                    }
                    else
                    {
                        inquisitor.world.audios[id].targetvolume = inquisitor.world.audios[id].startvolume;
                    }

                         //inquisitor.log( 0, inquisitor.world.audios[id].targetvolume );

                    inquisitor.world.audios[id].firstbuffer.setVolume( inquisitor.world.audios[id].targetvolume );
                }
                else
                {
                    var selectedbuffer   = inquisitor.world.audios[id].usefirstbuffer 
                        ? inquisitor.world.audios[id].firstbuffer
                        : inquisitor.world.audios[id].secondbuffer;
                    var nextbuffer       = !inquisitor.world.audios[id].usefirstbuffer 
                        ? inquisitor.world.audios[id].firstbuffer
                        : inquisitor.world.audios[id].secondbuffer;

                    //

                    if( selectedbuffer.getPercent() > inquisitor.world.audios[id].loopat
                        && !inquisitor.world.audios[id].crossfading )
                    {
                        inquisitor.log( 0, "Crossfade: Began" );

                        nextbuffer.play();
                        nextbuffer.fadeIn( 5000 );
                        selectedbuffer.fadeOut( 5000, function () {
                            this.stop();
                            inquisitor.world.audios[id].crossfading = false;

                            inquisitor.log( 0, "Crossfade: Complete" );
                        });
                        inquisitor.world.audios[id].usefirstbuffer = !inquisitor.world.audios[id].usefirstbuffer;
                        inquisitor.world.audios[id].crossfading = true;
                    }

                    //

                    inquisitor.world.audios[id].targetvolume = inquisitor.world.audios[id].endvolume;
                    selectedbuffer.setVolume( inquisitor.world.audios[id].targetvolume );
                }

                //inquisitor.log( 0, "Volume: " + inquisitor.world.audios[id].targetvolume );
            }
        }
    }

    setTimeout( function ()
    {
        inquisitor.updateambientaudio();
    }, 1000 / 4 );
}

Inquisitor.prototype.log = function( priority, text, origin )
{
  var allow = priority >= 0;

  var prefix = "";
  for( var i = 0; i < priority; i++ )
  {
    prefix += ">> ";
  }
  prefix += "inquisitor";

  var hasorigin = origin !== null && origin !== undefined;
  if( hasorigin )
  {
    prefix += origin;
  }

  if( allow )
  {
    var finallog = prefix + ": " + text;
    console.log( finallog );
    inquisitor.render.log += '— ' + finallog + '\n';
  }
}

Inquisitor.prototype.displayworld = function( raw, index )
{
    inquisitor.crossfadeelement( $( "#core" ), 1500, 500, null, true );
    //inquisitor.begindisplay();
}

Inquisitor.prototype.createagent = function( raw, index )
{
    /*var newagent = new inquisitoragent();
    newagent.phraseraw( raw, index );

    inquisitor.world.agents[newagent.name] = newagent;*/
}

Inquisitor.prototype.getlocation = function ( index )
{
    return inquisitor.world.rawlocations[index];
}

Inquisitor.prototype.accessreferencebufferforid = function ( index )
{
    return inquisitor.world.referencebuffer[inquisitor.world.rawlocations[index].name];
}

Inquisitor.prototype.setlocation = function ( index, location )
{
    inquisitor.world.rawlocations[index] = location;
}

Inquisitor.prototype.tryfindmutuallink = function ( linktargetid, location )
{
    inquisitor.log( 0, "Testing mutual link from: " + inquisitor.world.rawlocations[linktargetid].fullname + " to: " + location.fullname );

    var mutualadditionlinks = inquisitor.world.rawlocations[linktargetid].linkadditions;
    var mutualoverridelinks = inquisitor.world.rawlocations[linktargetid].linkoverrides;

    var mutuallink1 = mutualoverridelinks[location.name];
    var mutuallink2 = mutualadditionlinks[location.fullname];
    var mutuallink3 = mutualadditionlinks[location.name];

    if ( mutuallink1 !== undefined && mutuallink1 !== null )
    {
        return mutuallink1;
    }

    if ( mutuallink2 !== undefined && mutuallink2 !== null )
    {
        return mutuallink2;
    }

    if ( mutuallink3 !== undefined && mutuallink3 !== null )
    {
        return mutuallink3;
    }

    inquisitor.log( 0, "No mutual link found from: " + inquisitor.world.rawlocations[linktargetid].name + " to: " + location.name );

    return null;
}

Inquisitor.prototype.findlocationbyfulltitle = function ( fullname )
{
    inquisitor.log( 0, "inquisitor: Looking for location: " + fullname );
    for ( var id in inquisitor.world.rawlocations )
    {
        var location = inquisitor.getlocation( id );
        if ( fullname == location.fullname )
        {
            inquisitor.log( 0, "inquisitor: Found location: " + fullname );
            return location.id;
        }
    }

    return -1;
}

Inquisitor.prototype.findlocationbytitle = function ( title, from )
{
    var selectedid = -1;
    var bestoptimum = -1;

    //inquisitor.log( 0, "Looking for location in regions: " + title );

    //inquisitor.log( 0, "Looking for location: " + title + ", from: " + inquisitor.world.rawlocations[from].fullname );
    var segmentprogress = 0, currentoptimum = 0;
    for ( var id in inquisitor.world.rawlocations )
    {
        var location = inquisitor.world.rawlocations[id];
        
        //inquisitor.log( 0, "Testing location: " + title.trim() + ", with: " + location.name.trim() );
        if ( title.trim() === location.name.trim() )
        {
            inquisitor.log( -1, "Found Matching Title: " + location.fullname );

            for ( var segmentid in location.namesegments )
            {
                if ( location.namesegments[segmentid] === inquisitor.world.rawlocations[from].namesegments[segmentprogress] )
                {
                    currentoptimum++;
                    inquisitor.log( -1, "Increasing optimum for: " + location.fullname );
                }

                segmentprogress++;
            }

            if ( currentoptimum >= bestoptimum )
            {
                selectedid = id;
                inquisitor.log( -1, "Set optimal location as: " + location.fullname );
                bestoptimum = currentoptimum;
            }
        }

        currentoptimum = 0;
        segmentprogress = 0;
    }

    //

    if( selectedid === -1 )
    {
        var region = inquisitor.searchallregions( title );
        if( region !== undefined && region !== null )
        {
            //inquisitor.log( 0, "Found location in regions at: " + region.firstid );
            return region.firstid;
        }
    }

    //

    return selectedid;
}

Inquisitor.prototype.getparent = function ( id )
{
    return inquisitor.getlocation( inquisitor.getlocation(id).parentid );
}

Inquisitor.prototype.getregionparent = function ( id )
{
    return inquisitor.findinregions( id, -1 );
}

Inquisitor.prototype.searchallregions = function ( title )
{
    var result = [];
    var GetAllThings = function( thing, depth ) 
    {
        var keys = Object.keys(thing.children);
        for(var i = 0; i < keys.length; i++ ) 
        {
            var child = thing.children[keys[i]];
            if( Object.keys(child.children).length > 0 )
            {
                result.push( child );
                GetAllThings( child, depth++ );
            }
        }
    
        return result;
    };

    GetAllThings( inquisitor.world.regions, 0 );
    //console.log( result );
    for( var i = 0; i < result.length; i++ ) 
    {
        //inquisitor.log( 0, "Testing: " + result[i].name.trim() + ", with: " + title.trim() );
        if( result[i].name.trim() === title.trim() )
        {
            return result[i];
        }
    }
}

Inquisitor.prototype.findinregions = function ( id, searchoffset )
{
    if ( searchoffset === null || searchoffset === undefined )
    {
        searchoffset = 0;
    }

    var location = inquisitor.getlocation( id );
    if ( location === null || location === undefined )
    {
        return null;
    }

    var region = inquisitor.world.regions;
    var regionarray = [];

    //inquisitor.log( 0, 'findinregions searching for region info of location, ' + location.name + ' with search offset ' + searchoffset );

    var searchindex = 0; var searchmax = ( location.namesegments.length + searchoffset );
    //inquisitor.log( '0, findinregions found searchmax of, ' + searchmax );

    while ( searchindex < searchmax )
    {
        var searchregion = location.namesegments[searchindex];

        //inquisitor.log( 0, 'found at depth ' + searchindex + ' a region for, ' + location.name + ' named ' + searchregion );

        if ( region.children[searchregion] !== undefined && region.children[searchregion] !== null )
        {
            region = region.children[searchregion];
        }
        searchindex++;
    }

    return region;
}

Inquisitor.prototype.recursiveupwardsrecieve = function ( locationid, variable, valueunused, depth )
{
    if ( depth === null || depth === undefined )
    {
        depth = 0;
    }

    depth++;

    var location = inquisitor.getlocation( locationid );
    var maxdepth = location.namesegments.length;

    var parent = inquisitor.findinregions( locationid, -depth );
    if ( parent !== null && parent !== undefined && depth < maxdepth  )
    {
        if ( parent[variable] !== valueunused && parent[variable] !== undefined && parent[variable] !== null )
        {
            inquisitor.log( -1, 'recursiveupwardsrecieve found value, ' + parent[variable] + ' at ' + parent.name + ' returning.' )
            return parent[variable];
        }
        else
        {
            inquisitor.log( -1, 'recursiveupwardsrecieve found nothing at ' + parent.name + ' continuing upwards. Depth: ' + depth )
            return inquisitor.recursiveupwardsrecieve( locationid, variable, valueunused, depth );
        }
    }
}

Inquisitor.prototype.recursivedownwardsdefine = function ( locationid, variable, valueunused )
{
    var parent = inquisitor.getregionparent( locationid );
    var setto = inquisitor.getlocation( locationid )[variable];

    if ( setto === valueunused )
    {
        return;
    }

    if ( parent !== null && parent !== undefined )
    {
        for ( var childid in parent.children )
        {
            var childregion = parent.children[childid];
            if ( childregion[variable] === valueunused )
            {
                childregion[variable] = setto;
                inquisitor.recursivedownwardsdefine( childregion, variable, valueunused );
            }
        }
    }
}

Inquisitor.prototype.enumeratechildren = function ( id )
{
    var childrenfound = [];

    var locationmain = inquisitor.findinregions( id ).children;
    for ( var objectname in locationmain )
    {
        var childid = locationmain[objectname].id;

        if ( childid !== undefined && childid !== null )
        {
            if ( childid != -1 )
            {
                inquisitor.log( 0, "Enumerating Child: " + childid );
                childrenfound.push( childid );
            }
        }
    }

    return childrenfound;
}

Inquisitor.prototype.traverselinearlocation = function ()
{
    persistentworld.world.linearlocationprogress++;
    return inquisitor.world.linearlocations[persistentworld.world.linearlocationprogress-1];
}

Inquisitor.prototype.enumeratesiblings = function ( id )
{
    var results = {};
    results.siblingsfound = [];
    results.child = 0;
    results.firstchild = -1;
    results.isfirstchild = false;

    var parentregion = inquisitor.getregionparent( id );

    for ( var objectname in parentregion.children )
    {
        if ( results.child > 2 )
        {
            var parentid = inquisitor.getparent( id ).id;
            var parentparentid = inquisitor.getparent( parentid ).id;
            var childid = parentregion.id;

            if ( childid !== undefined && childid !== null )
            {
                if ( results.firstchild === -1 )
                {
                    results.firstchild = childid;
                    results.isfirstchild = ( results.firstchild == id );
                }

                if ( childid != -1 && childid != id )
                {
                    var siblingname = inquisitor.world.rawlocations[childid].name;
                    var siblingsubregion = inquisitor.world.rawlocations[childid].subregion;
                    var oursubregion = inquisitor.world.rawlocations[id].subregion;
                    var insidesiblingsubregion = oursubregion === siblingsubregion;

                    if ( !inquisitor.world.rawlocations[childid].isobject && !inquisitor.world.rawlocations[id].isobject )
                    {
                        var siblingname = insidesiblingsubregion ? siblingname : siblingsubregion;
                        inquisitor.log( 0, "Enumerating Sibling: " + childid + ". Giving Name: " + siblingname );
                        results.siblingsfound.push( childid );
                    }
                }
            }
        }
        results.child++;
    }

    return results;
}

Inquisitor.prototype.findpreviousreferencetitle = function ( inputreferenceid )
{
    var inputreferencename = inquisitor.getlocation( inputreferenceid ).name;
    var references = inquisitor.accessreferencebufferforid( inputreferenceid );
    if ( references !== undefined && references !== null )
    {
        for ( var index in references )
        {
            var location = inquisitor.getlocation( references[index].index );
            return location.linkadditions[inputreferencename].title;
        }
    }

    return inputreferencename;
}

Inquisitor.prototype.recursiveregionsearchbytitle = function ( currentregion, regiontitle )
{
    for ( var childid in currentregion.children )
    {
        var childregion = currentregion.children[childid];
        inquisitor.recursiveregionsearchbytitle( childregion, regiontitle );

        if( childregion.name === regiontitle )
        {
          return childregion;
        }

      //  console.log( childregion.name );
    }
}

Inquisitor.prototype.recursivechildenumerate = function ( regiontitle, enumarray )
{
    var parent = inquisitor.recursiveregionsearchbytitle( inquisitor.world.regions, regiontitle );
    if ( parent !== null && parent !== undefined )
    {
        for ( var childid in parent.children )
        {
            var childregion = parent.children[childid];
            enumarray.push( childregion.firstid );
            inquisitor.recursivechildenumerate( childregion, enumarray );
        }
    }
}

Inquisitor.prototype.processlinkadditions = function ( id )
{
    var availableadditions = [];

    for ( var index in inquisitor.world.rawlocations[id].linkadditions )
    {
        var link = inquisitor.world.rawlocations[id].linkadditions[index];

        var linklocationid = inquisitor.findlocationbyfulltitle( link.target );
        if ( linklocationid === -1 )
        {
            linklocationid = inquisitor.findlocationbytitle( link.target, id );
        }

        if( link.iswildcard )
        {
            var wildcardlocations = [];
            inquisitor.recursivechildenumerate( link.target, wildcardlocations );
            linklocationid = wildcardlocations[Math.floor( Math.random() * wildcardlocations.length )];
            link.linkdirection = Math.floor( Math.random() * 4 ) + 1;
        }

        if ( linklocationid !== -1 && !link.inlinelinkreference )
        {
            var finallinktitle = link.title === '' ? inquisitor.world.rawlocations[linklocationid].name : link.title;

            availableadditions.push( { index: linklocationid, title: finallinktitle, initiatinglink: link, iswildcard: link.iswildcard } );
            inquisitor.log( 0, "Adding link to: " + inquisitor.world.rawlocations[linklocationid].fullname + ", title: " + finallinktitle );
        }
        else if (link.inlinelinkreference)
        {
            inquisitor.log( 0, "Inline link. Ignoring. Target: " + link.target );
        }
        else
        {
            inquisitor.log( 1, "Bad link. Target: " + link.target );
        }
    }

    return availableadditions;
}

Inquisitor.prototype.processtimelineevent = function ( event )
{
    if ( !event.istimelineevent )
        return '';

    var firsteventhtml = ( inquisitor.render.truetimelineeventsadded == 0 ? ' class="active selected"' : 'class="active"' );
    var datehtml = event.timeline.fulldate.day + "/" + event.timeline.fulldate.month + "/" + event.timeline.fulldate.year + '"';
    var elementhtml = '<li tabindex="-1" id="' + datehtml + firsteventhtml + ' data-date="';
    elementhtml += datehtml + '><h1>' + event.timeline.title + "</h1>";
    //elementhtml += '<em>' + event.timeline.displaydate + "</em>";

    var processedeventtext = inquisitor.processdescriptiontext( event.text, false );
    elementhtml += '<p>' + processedeventtext + '</p></li>';

    //

    var referencehtml = '<li><a tabindex="-1" id="r' + inquisitor.render.timelineeventsadded + '" data="' + event.timeline.backgroundurl + '" href="#0" ' + firsteventhtml + ' data-date="' + datehtml + ">" + event.timeline.displaydate + '</a></li>';

    inquisitor.render.timelineeventsadded++;
    inquisitor.render.truetimelineeventsadded++;

    return { ref: referencehtml, elem: elementhtml };
}

Inquisitor.prototype.processtimelineeventempty = function ( year )
{
    var datehtml = "01/01/" + year + '"';
    var referencehtml = '<li><a tabindex="-1" class="inactive" id="r' + inquisitor.render.timelineeventsadded + '" href="#0" data-date="' + datehtml + ">" + year + '</a></li>';
    var elementhtml = '<li tabindex="-1" id="' + datehtml + ' data-date="';
    elementhtml += datehtml + '><h1>' + year + "</h1>";
    //elementhtml += '<em>' + year + "</em>";
    elementhtml += '<p> </p></li>';

    inquisitor.render.timelineeventsadded++;

    return { ref: referencehtml, elem: elementhtml };
}

Inquisitor.prototype.updatetimeline = function ()
{
    var finalreferencehtml = '<ol>';
    var finaltimelinehtml = '<ol>';

    var year = -1;
    var lastyear = -1;
    var firstyear = -1;

    for ( var index in inquisitor.world.rawevents )
    {
        if ( !inquisitor.world.rawevents[index].istimelineevent )
            continue;

        var eventyear = inquisitor.world.rawevents[index].timeline.fulldate.year;

        if( year === -1 )
        {
          year = eventyear;
          firstyear = year;
        }
        lastyear = eventyear;

        while ( year <= eventyear )
        {
            var result = inquisitor.processtimelineeventempty( year );
            finalreferencehtml += result.ref;
            finaltimelinehtml += result.elem;
            year++;
        }

        var result = inquisitor.processtimelineevent( inquisitor.world.rawevents[index] );
        if ( result != '' )
        {
            finalreferencehtml += result.ref;
            finaltimelinehtml += result.elem;
        }
    }

    eventsMinDistance = 1;
    timelineventlapse = Math.round( ( lastyear - firstyear ) / 4 );

    finalreferencehtml += '</ol>';
    finaltimelinehtml += '</ol>';

    $( "#events-references" ).html( finalreferencehtml );
    $( "#events-content" ).html( finaltimelinehtml );
}

Inquisitor.prototype.findlinks = function ( id )
{
    var links = [], potentiallinks = [];

    /*var siblings = inquisitor.enumeratesiblings( id ).siblingsfound;
    for( var index in siblings )
    {
        inquisitor.log( 0, "Found Sibling: " + siblings[index] );
        potentiallinks.push( siblings[index] );
    }

    var children = inquisitor.enumeratechildren( id );
    for ( var index in children )
    {
        inquisitor.log( 0, "Found Child: " + children[index] );
        potentiallinks.push( children[index] );
    }
    
    var references = inquisitor.accessreferencebufferforid( id );
    if ( references !== undefined && references !== null )
    {
        for ( var index in references )
        {
            var referenceid = references[index].index;
            potentiallinks.push( referenceid );
        }
    }*/

    var additions = inquisitor.processlinkadditions( id );
    for ( var index in additions )
    {
        inquisitor.log( 0, "Found Link Additon: " + additions[index] );
        potentiallinks.push( additions[index].index );
    }

    //

    for ( var index in potentiallinks )
    {
        var isduplicate = false;
        for ( var indextwo in potentiallinks )
        {
          if( index !== indextwo )
          {
            isduplicate = ( potentiallinks[index] === potentiallinks[indextwo] );

            if( isduplicate )
            {
              inquisitor.log( 1, "Link to: " + potentiallinks[index] + ", is a duplicate." );
            }
          }
        }

        var result = inquisitor.cantraverse( id, potentiallinks[index], null, true );
        if( result.success && !isduplicate)
        {
            inquisitor.log( 0, "Allowing link to: " + potentiallinks[index] );
            links.push( potentiallinks[index] );
        }
    }

    return links;
}

Inquisitor.prototype.randominarray = function ( array )
{
    var randomvalue = Math.floor( Math.random() * array.length );
    return array[randomvalue];
}

Inquisitor.prototype.percentagechance = function ( percent )
{
    var randomvalue = Math.floor( Math.random() * 100 );
    return ( randomvalue < percent );
}

Inquisitor.prototype.rebuildregions = function ()
{
    for ( var member in inquisitor.world.regions ) delete inquisitor.world.regions[member];
    inquisitor.world.linearlocations = [];
    inquisitor.world.regions = {};
    for ( var index in inquisitor.world.rawlocations )
    {
        var location = inquisitor.getlocation( index );
        location.parentid = inquisitor.findparent( inquisitor.world, location );

        var recievedbackgroundimage = inquisitor.recursiveupwardsrecieve( index, 'backgroundimage', '' );
        if ( recievedbackgroundimage !== null && recievedbackgroundimage !== undefined )
        {
            location.backgroundimage = recievedbackgroundimage;
            //inquisitor.log( 0, "Found parent background: " + location.backgroundimage );
        }

        var recievedbackgroundopacity = inquisitor.recursiveupwardsrecieve( index, 'backgroundopacity', '0.3' );
        if ( recievedbackgroundopacity !== null && recievedbackgroundopacity !== undefined )
        {
            location.backgroundopacity = recievedbackgroundopacity;
            //inquisitor.log( 0, "Found parent backgroundopacity: " + location.backgroundopacity );
        }

        var recievedbackgroundbrightness = inquisitor.recursiveupwardsrecieve( index, 'backgroundbrightness', '0.5' );
        if ( recievedbackgroundbrightness !== null && recievedbackgroundbrightness !== undefined )
        {
            location.backgroundbrightness = recievedbackgroundbrightness;
            //inquisitor.log( 0, "Found parent backgroundbrightness: " + location.backgroundbrightness );
        }

        var recievedcolor = inquisitor.recursiveupwardsrecieve( index, 'color', '#eeeeee' );
        if ( recievedcolor !== null && recievedcolor !== undefined )
        {
            location.color = recievedcolor;
            //inquisitor.log( 0, "Found parent color: " + location.color );
        }

        var recievedstate = inquisitor.recursiveupwardsrecieve( index, 'state', 'stateless' );
        if ( recievedstate !== null && recievedstate !== undefined )
        {
            location.state = recievedstate;
            if ( location.state === 'linear' )
            {
                inquisitor.log( 0, "Found linear state." );
                inquisitor.world.linearlocations.push( location.id );
            }
            //inquisitor.log( 0, "Found parent state: " + location.state );
        }

        var recievedcssadditional = inquisitor.recursiveupwardsrecieve( index, 'cssadditional', '' );
        if ( recievedcssadditional !== null && recievedcssadditional !== undefined )
        {
            location.cssadditional = recievedcssadditional;
            //inquisitor.log( 0, "Found parent cssadditional: " + location.cssadditional );
        }

        inquisitor.setlocation( index, location );
    }
}

Inquisitor.prototype.placeentityinworld = function ( entityindex, locationindex )
{
    var entity   = inquisitor.getlocation( entityindex );
    var location = inquisitor.getlocation( locationindex );

    var namesegments = [];
    for( var index in location.namesegments )
    {
        namesegments.push( location.namesegments[index] );
    }

    if ( namesegments[namesegments.length - 1] !== entity.name )
    {
        namesegments.push( entity.name );
    }

    entity.namesegments = namesegments;
    entity = inquisitor.writelocationinfo( entity );

    //

    //entity.parent = findparent( inquisitor.world, entity );
    inquisitor.setlocation( entityindex, entity );
    inquisitor.rebuildregions();

    //
}

Inquisitor.prototype.rebuildentities = function ( locationarray )
{
    for ( var index in locationarray )
    {
        inquisitor.placeentityinworld( inquisitor.world.entities[index], locationarray[index] );
    }
}

Inquisitor.prototype.writeentities = function ()
{
    var locationarray = [];
    for ( var index in inquisitor.world.entities )
    {
        var parentid = inquisitor.getparent(inquisitor.world.entities[index]).id;
        locationarray.push( parentid );
    }
    return locationarray;
}

Inquisitor.prototype.updateentities = function ()
{
    for( var index in inquisitor.world.entities )
    {
        var willmove = inquisitor.percentagechance( 20 );
        if( willmove )
        {
            var entity = inquisitor.getlocation( inquisitor.world.entities[index] );
            var parentid = inquisitor.getparent( inquisitor.world.entities[index] ).id;

            var links = inquisitor.findlinks( parentid );
            for ( var linkindex in links )
            {
                inquisitor.log( 0, "Possible location for agent to link to: " + inquisitor.getlocation( links[linkindex] ).fullname );
            }

            var finallinkindex;
            if ( links.length > 0 )
            {
                finallinkindex = inquisitor.randominarray( links );
            }
            else
            {
                finallinkindex = inquisitor.getparent( parentid ).id;
                break;
            }

            inquisitor.log( 1, "Agent moving to: " + inquisitor.getlocation( finallinkindex ).fullname + ", from: " + inquisitor.getlocation( parentid ).fullname );
            inquisitor.placeentityinworld( inquisitor.world.entities[index], finallinkindex );
        }
    }
}

//

Inquisitor.prototype.directiontoint = function ( direction )
{
    switch ( direction )
    {
        case "North":
            return 1;
        case "East":
            return 2;
        case "South":
            return 3;
        case "West":
            return 4;
        case "Up":
            return 5;
        case "Down":
            return 6;
    }

    return 0;
}

Inquisitor.prototype.intdirectioninvert = function ( int )
{
    switch ( int )
    {
        case 1:
            return 3;
        case 2:
            return 4;
        case 3:
            return 1;
        case 4:
            return 2;
        case 5:
            return 6;
        case 6:
            return 5;
    }

    return 0;
}

Inquisitor.prototype.inttodirection = function ( int )
{
    switch ( int )
    {
        case 1:
            return "North";
        case 2:
            return "East";
        case 3:
            return "South";
        case 4:
            return "West";
        case 5:
            return "Up";
        case 6:
            return "Down";
    }

    return "Stationary";
}

Inquisitor.prototype.writelocationinfo = function ( location )
{
    location.fullname = "";
    for ( var index in location.namesegments )
    {
        location.fullname += location.namesegments[index] + ( ( index < location.namesegments.length - 1 ) ? " - " : "" );
    }
    inquisitor.log( 0, "Recreated full name: " + location.fullname );

    location.region = location.namesegments[0];
    location.subregion = location.namesegments[1];
    location.name = location.namesegments[location.namesegments.length - 1];

    inquisitor.log( 0, "Found location region: " + location.region );
    inquisitor.log( 0, "Found location name: " + location.name );

    return location;
};

Inquisitor.prototype.findparent = function ( result, location )
{
    var regionceptiondepth = 0;
    var parentregionception;
    var regionception = result.regions;
    var lastid = -1;

    while ( regionceptiondepth < location.namesegments.length )
    {
        if ( regionception.children === null || regionception.children === undefined )
        {
            regionception.children = {};
        }

        if ( !( regionception.children.hasOwnProperty( location.namesegments[regionceptiondepth] ) ) )
        {
                regionception.children[location.namesegments[regionceptiondepth]] = {
                    id: location.id,
                    firstid: location.id,
                    isobject: location.isobject,
                    backgroundimage: location.backgroundimage,
                    backgroundopacity: location.backgroundopacity,
                    backgroundbrightness: location.backgroundbrightness,
                    color: location.color,
                    state: location.state,
                    cssadditional: location.cssadditional,
                    children: {},
                    parentid: lastid,
                    name: location.namesegments[regionceptiondepth]
                };
        }

        if ( !regionception.children[location.namesegments[regionceptiondepth]].isobject )
        {
            lastid = regionception.children[location.namesegments[regionceptiondepth]].id;
        }

        parentregionception = regionception;
        regionception = regionception.children[location.namesegments[regionceptiondepth]];
        regionceptiondepth++;
    }

    return parentregionception.id;
};
