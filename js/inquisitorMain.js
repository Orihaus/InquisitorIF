function Inquisitor( )
{
    this.logic = {
      combinationstore: {},
      indialogue: false,
      currenteventactive: false,
      soundmuted: false,
      viewingtimeline: true,

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

    this.render = {
      finaldescriptionsegments: {},
      expanddescription: true,
      lastmousepagex: 0,
      lastmousepagey: 0,
      backgroundimageurltimeline: '',
      backgroundimageurl: '',
      color: "#a69471",
      currentbackgroundbuffer: "backgroundprimary",
      timelineeventsadded: 0,
      truetimelineeventsadded: 0,
      showingvessels: false,
      lastbackground: ''
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

    inquisitor.begindisplay();
    //inquisitor.displayworld();
}

Inquisitor.prototype.displayworld = function( raw, index )
{
    inquisitor.crossfadeelement( $( "#core" ), 1500, 500, null, true );
    //inquisitor.begindisplay();
    console.log('inquisitor: displayworld()');
}

Inquisitor.prototype.createagent = function( raw, index )
{
    /*var newagent = new inquisitoragent();
    newagent.phraseraw( raw, index );

    inquisitor.world.agents[newagent.name] = newagent;*/
}

Inquisitor.prototype.getlocation = function ( index )
{
    //console.log( inquisitor.world );
    return inquisitor.world.rawlocations[index];
}

Inquisitor.prototype.accessreferencebufferforid = function ( index )
{
    return inquisitor.world.referencebuffer[inquisitor.world.rawlocations[index].name];
}

Inquisitor.prototype.setlocation = function ( index, location )
{
    //console.log( inquisitor.world );
    inquisitor.world.rawlocations[index] = location;
}

Inquisitor.prototype.tryfindmutuallink = function ( linktargetid, location )
{
    //console.log( "inquisitor: Testing mutual link from: " + linktargetid + " to: " + location.name );

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

    console.log( "inquisitor: No mutual link found from: " + inquisitor.world.rawlocations[linktargetid].name + " to: " + location.name );

    return null;
}

Inquisitor.prototype.findlocationbyfulltitle = function ( fullname )
{
    //console.log( "inquisitor: Looking for location: " + fullname );
    for ( var id in inquisitor.world.rawlocations )
    {
        var location = inquisitor.getlocation( id );
        if ( fullname == location.fullname )
        {
            //console.log( "inquisitor: Found location: " + fullname );
            return location.id;
        }
    }

    return -1;
}

Inquisitor.prototype.findlocationbytitle = function ( title )
{
    var selectedid = -1;
    var bestoptimum = 0;

    //console.log( "inquisitor: Looking for location: " + title );
    for ( var id in inquisitor.world.rawlocations )
    {
        var location = inquisitor.world.rawlocations[id];
        if ( title == location.name )
        {
            //console.log( "inquisitor: Found Matching Title: " + location.fullname );

            var segmentprogress = 0, currentoptimum = 0;
            for ( var segmentid in location.namesegments )
            {
                if ( location.namesegments[segmentid] === inquisitor.world.rawlocations[persistentworld.store.currentWorldLocationID].namesegments[segmentprogress] )
                {
                    currentoptimum++;
                }

                segmentprogress++;
            }

            if ( currentoptimum >= bestoptimum )
            {
                selectedid = id;
            }
        }
    }

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

    //console.log( 'inquisitor: findinregions searching for region info of location, ' + location.name + ' with search offset ' + searchoffset );
    //console.log( location.namesegments );

    var searchindex = 0; var searchmax = ( location.namesegments.length + searchoffset );
    //console.log( 'inquisitor: findinregions found searchmax of, ' + searchmax );

    while ( searchindex < searchmax )
    {
        var searchregion = location.namesegments[searchindex];

        //console.log( 'inquisitor: found at depth ' + searchindex + ' a region for, ' + location.name + ' named ' + searchregion );
        //console.log( region );

        if ( region.children[searchregion] !== undefined && region.children[searchregion] !== null )
        {
            region = region.children[searchregion];
        }
        searchindex++;
    }

    //console.log( region );

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
            console.log( 'inquisitor: recursiveupwardsrecieve found value, ' + parent[variable] + ' at ' + parent.name + ' returning.' )
            return parent[variable];
        }
        else
        {
            console.log( 'inquisitor: recursiveupwardsrecieve found undefined, at ' + parent.name + ' continuing upwards. Depth: ' + depth )
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
                //console.log( "inquisitor: Enumerating Child: " + childid );
                childrenfound.push( childid );
            }
        }
    }

    return childrenfound;
}

Inquisitor.prototype.traverselinearlocation = function ()
{
    persistentworld.world.linearlocationprogress++;
    //console.log( inquisitor.world.linearlocations );
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
                        //console.log( "inquisitor: Enumerating Sibling: " + childid + ". Giving Name: " + siblingname );
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

Inquisitor.prototype.processlinkadditions = function ( id )
{
    var availableadditions = [];

    for ( var index in inquisitor.world.rawlocations[id].linkadditions )
    {
        var link = inquisitor.world.rawlocations[id].linkadditions[index];

        var linklocationid = inquisitor.findlocationbyfulltitle( link.target );
        if ( linklocationid === -1 )
        {
            linklocationid = inquisitor.findlocationbytitle( link.target );
        }

        if ( linklocationid != -1 && !link.inlinelinkreference )
        {
            var finallinktitle = link.title === '' ? inquisitor.world.rawlocations[linklocationid].name : link.title;

            availableadditions.push( { index: linklocationid, title: finallinktitle, initiatinglink: link } );
            //console.log( "inquisitor: Adding link to: " + linklocationid );
        }
        else
        {
            console.log( "inquisitor: Bad link" );
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
    var elementhtml = '<li id="' + datehtml + firsteventhtml + ' data-date="';
    elementhtml += datehtml + '><h1>' + event.timeline.title + "</h1>";
    //elementhtml += '<em>' + event.timeline.displaydate + "</em>";

    var processedeventtext = inquisitor.processdescriptiontext( event.text, false );
    elementhtml += '<p>' + processedeventtext + '</p></li>';

    //

    var referencehtml = '<li><a id="r' + inquisitor.render.timelineeventsadded + '" data="' + event.timeline.backgroundurl + '" href="#0" ' + firsteventhtml + ' data-date="' + datehtml + ">" + event.timeline.displaydate + '</a></li>';

    //console.log( referencehtml );
    //console.log( elementhtml );

    inquisitor.render.timelineeventsadded++;
    inquisitor.render.truetimelineeventsadded++;

    return { ref: referencehtml, elem: elementhtml };
}

Inquisitor.prototype.processtimelineeventempty = function ( year )
{
    var datehtml = "01/01/" + year + '"';
    var referencehtml = '<li><a class="inactive" id="r' + inquisitor.render.timelineeventsadded + '" href="#0" data-date="' + datehtml + ">" + year + '</a></li>';
    var elementhtml = '<li id="' + datehtml + ' data-date="';
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

    var siblings = inquisitor.enumeratesiblings( id ).siblingsfound;
    for( var index in siblings )
    {
        //console.log( "inquisitor: Found Sibling: " + siblings[index] );
        potentiallinks.push( siblings[index] );
    }

    var children = inquisitor.enumeratechildren( id );
    for ( var index in children )
    {
        //console.log( "inquisitor: Found Child: " + children[index] );
        potentiallinks.push( children[index] );
    }

    var additions = inquisitor.processlinkadditions( id );
    for ( var index in additions )
    {
        //console.log( "inquisitor: Found Link Additon: " + additions[index] );
        potentiallinks.push( additions[index].index );
    }

    var references = inquisitor.accessreferencebufferforid( id );
    if ( references !== undefined && references !== null )
    {
        for ( var index in references )
        {
            var referenceid = references[index].index;
            potentiallinks.push( referenceid );
        }
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
          }
        }

        console.log( "inquisitor: link to: " + potentiallinks[index] + ", isduplicate: " + isduplicate );

        var result = inquisitor.cantraverse( id, potentiallinks[index], null, true );
        if( result.success && !isduplicate)
        {
            //console.log( "inquisitor: Allowing link to: " + potentiallinks[index] );
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
            console.log( "inquisitorParse: Found parent background: " + location.backgroundimage );
        }

        var recievedcolor = inquisitor.recursiveupwardsrecieve( index, 'color', '' );
        if ( recievedcolor !== null && recievedcolor !== undefined )
        {
            location.color = recievedcolor;
            console.log( "inquisitorParse: Found parent color: " + location.color );
        }

        var recievedstate = inquisitor.recursiveupwardsrecieve( index, 'state', 'stateless' );
        if ( recievedstate !== null && recievedstate !== undefined )
        {
            location.state = recievedstate;
            if ( location.state === 'linear' )
            {
                //console.log( "inquisitorParse: Found linear state. " );
                inquisitor.world.linearlocations.push( location.id );
            }
            console.log( "inquisitorParse: Found parent state: " + location.state );
        }

        inquisitor.setlocation( index, location );
    }

    console.log( inquisitor.world.regions );
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
                //console.log( "inquisitor: Possible location to link to: " + inquisitor.getlocation( links[linkindex] ).fullname );
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

            //console.log( inquisitor.world.entities );
            console.log( "inquisitor: Moving to: " + inquisitor.getlocation( finallinkindex ).fullname + ", from: " + inquisitor.getlocation( parentid ).fullname );
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
    //console.log( "inquisitorParse: Recreated full name: " + location.fullname );

    location.region = location.namesegments[0];
    location.subregion = location.namesegments[1];
    location.name = location.namesegments[location.namesegments.length - 1];

    //console.log( "inquisitorParse: Found location region: " + location.region );
    //console.log( "inquisitorParse: Found location name: " + location.name );

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
                    color: location.color,
                    state: location.state,
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
