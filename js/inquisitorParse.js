Inquisitor.prototype.parse = function ( inputsource, maincallback )
{
    var result =
    {
        regions: {},
        rawevents: [],
        rawdialogue: [],
        rawlocations: [],
        entities: [],
        agents: {},
        linearlocations: [],

        referencebuffer: {},
        entitydefinitionbuffer: [],
        conceptdefinitionbuffer: [],
        scriptlocations: []
    };

    var at = 0, ch, escapee =
    {
        '"': '"',
        '\\': '\\',
        '/': '/',
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
    }, text;

    var finished = false;

    var error = function ( m )
    {
        throw {
            name: 'SyntaxError',
            message: m,
            at: at,
            text: text
        };
    };

    var previous = function ()
    {
        at -= 1;
        ch = text.charAt( at );
        return ch;
    };

    var next = function ( c )
    {
        if ( c && c !== ch )
        {
            error( "Expected '" + c + "' instead of '" + ch + "'" );
        }

        ch = text.charAt( at );

        at += 1;
        return ch;
    };

    var peeknextidentical = function ( check )
    {
        var firstchar, secondchar;
        firstchar = ch;
        secondchar = text.charAt( at );

        return ( firstchar === check && secondchar === check );
    }

    var peeknext = function ( checkone, checktwo )
    {
        var firstchar, secondchar;
        firstchar = ch;
        secondchar = text.charAt( at );

        return ( firstchar === checkone && secondchar === checktwo );
    }

    var checkempty = function( str )
    {
        return ( str === '' ) || ( str === '\n' ) || ( str === '\n\n' );
    }

    var previous = function ()
    {
        at -= 1;
        ch = text.charAt( at );
        return ch;
    };

    var grableadingwhitespace = function ()
    {
        var whitespace = '', originalposition = at;

        previous();
        //previous();
        while( ch === '\n' || ch === ' ' )
        {
            ch = text.charAt( at );
            whitespace += ch;

            at--;
        }
        at = originalposition;
        ch = text.charAt( at );

        //console.log( whitespace );

        return whitespace;
    };

    var white = function ()
    {
        var resultwhite = "";
        while ( ch && ch <= ' ' )
        {
            resultwhite += ch;
            next();
        }
        return resultwhite;
    };

    var value;  // Place holder for the value function.

    var regions = [];

    var processconditional = function ( conditionone, conditiontwo, conditionthree, conditionfour, conditionfive, conditionsix, conditionseven, conditioneight )
    {
        if ( conditiontwo === undefined || conditiontwo === null )
        {
            conditiontwo = conditionone;
        }
        if ( conditionthree === undefined || conditionthree === null )
        {
            conditionthree = conditionone;
        }
        if ( conditionfour === undefined || conditionfour === null )
        {
            conditionfour = conditionone;
        }
        if ( conditionfive === undefined || conditionfive === null )
        {
            conditionfive = conditionone;
        }
        if ( conditionsix === undefined || conditionsix === null )
        {
            conditionsix = conditionone;
        }
        if ( conditionseven === undefined || conditionseven === null )
        {
            conditionseven = conditionone;
        }
        if ( conditioneight === undefined || conditioneight === null )
        {
            conditioneight = conditionone;
        }

        var processingindex = 0;
        var processresult = '';

        while ( ch !== conditionone && ch !== conditiontwo && ch !== conditionthree && ch !== conditionfour && ch !== conditionfive && ch !== conditionsix && ch !== conditionseven && ch !== conditioneight )
        {
            if ( processingindex > 0 )
            {
                processresult += ch;
            }
            next();
            processingindex++;
        }

        return processresult;
    }

    var processlocationtitle = function ()
{
        var namesegments = [];
        var fullname = "";
        var namesegmentid = 0;
        var namesegmentcurrent = "";
        var namesegmentcurrentposition = 0;
        while ( at < text.length )
        {
            if ( namesegmentid == 0 || namesegmentcurrentposition > 1 )
            {
                namesegmentcurrent += ch;
            }
            fullname += ch;
            next();

            namesegmentcurrentposition++;
            if ( ch === '-' || ch === '\n' || ch === '|' || ch === '&' || ch === ':' )
            {
                namesegmentid++;
                namesegments.push( namesegmentcurrent.trim() );
                namesegmentcurrent = "";
                namesegmentcurrentposition = 0;
            }

            if ( ch === '&' )
            {
                //console.log( "inquisitorParse: Found Location Break." );
                break;
            }

            /*if ( ch === '|' )
            {
                location.illustration += processconditional( '\n' );
                console.log( "inquisitorParse: Found illustration: " + location.illustration );
                break;
            }*/

            if ( ch === '\n' || ch === ':' )
            {
                break;
            }
        }
        //console.log( "inquisitorParse: Processed potential location: " + fullname );
        //console.log( "inquisitorParse: Found " + namesegmentid + " name segments." );

        return namesegments;
    };

    var processlocation = function ( isconcept, conceptparentstaticname, conceptparentid )
    {
        if ( isconcept === null || isconcept === undefined )
        {
            isconcept = false;
        }

        if ( ch === '~' || ch === '^' || ch === ':' || ch === '|' )
        {
            var key,
                location = {};
            location.name = "";
            location.fullname = "";
            location.descriptionsegments = [];
            location.namesegments = [];
            location.eventid = -1;
            location.achievementname = "";
            location.conceptids = [];
            location.dialogueids = [];
            location.linkoverrides = {};
            location.linkadditions = {};
            location.id = result.rawlocations.length;
            location.isobject = ( ch === '^' );
            location.isconcept = isconcept;
            location.isentity = false;
            location.displayparent = location.isobject;
            location.illustration = '';
            location.descriptioninparent = "";
            location.hidden = false;
            location.inlinelinks = [];
            location.backgroundimage = '';
            location.hasconcepts = false;
            location.state = 'stateless';
            location.color = "";

            //console.log( "inquisitorParse: Processing " + ( location.isobject ? "Object" : "Location" ) );

            next();
            if ( ch === "^" )
            {
                location.displayparent = true;
                next();
            }
            else if ( ch === ':' )
            {
                location.isentity = true;
                //console.log( "inquisitorParse: Found Entity" );
                next();
            }

            if( result.rawdialogue.length > 0 )
            {
                for ( var dialogueindex = result.rawdialogue.length - 1; dialogueindex > -1; dialogueindex-- )
                {
                    if ( result.rawdialogue[dialogueindex].locationid == location.id )
                    {
                        location.dialogueids.push( result.rawdialogue[dialogueindex].id );
                        //console.log( "inquisitorParse: Attached Dialogue: " + location.dialogueids[location.dialogueids.length - 1] );
                    }
                }
            }

            if ( result.rawevents.length > 0 )
            {
                if ( result.rawevents[result.rawevents.length - 1].locationid == location.id )
                {
                    location.eventid = result.rawevents[result.rawevents.length - 1].id;
                    //console.log( "inquisitorParse: Attached Event: " + location.eventid );
                }
            }

            // Process Name //

            var processednames = [];
            while ( ch === '&' || processednames.length === 0 )
            {
                if ( processednames.length > 0 )
                {
                    next();
                }
                processednames.push( processlocationtitle() );
            }

            var selectedname = processednames[Math.floor( Math.random() * processednames.length )];

            //

            if ( ch === ':' )
            {
                location.staticname = processconditional( '\n' );
                selectedname.push( location.staticname );
                //console.log( "inquisitorParse: Found static name: " + staticname );
            }
            else
            {
                location.staticname = selectedname[selectedname.length - 1];
            }

            if ( isconcept )
            {
                location.namesegments = selectedname;
                location.namesegments.unshift( conceptparentstaticname );
                location.namesegments.unshift( "Concepts" );
                //console.log( location.namesegments );
            }
            else
            {
                location.namesegments = selectedname;
            }

            location = inquisitor.writelocationinfo( location );

            var bail = false;

            while ( peeknext( '\n', '>' ) )
            {
                next();

                if ( peeknextidentical( '>' ) )
                {
                    bail = true;
                    //console.log( "inquisitorParse: Bail" );
                }
                else if ( peeknext( '>', '?' ) )
                {
                    next();
                    var state = processconditional( '\n' ).trim();
                    //console.log( "inquisitorParse: Found state: " + state );
                    location.state = state;
                }
                else if ( peeknext( '>', '#' ) )
                {
                    var color = processconditional( '\n' ).trim();
                    console.log( "inquisitorParse: Found background color: " + color );
                    location.color = color;
                }
                else
                {
                    var backgroundimage = processconditional( '\n' );
                    //console.log( "inquisitorParse: Found background image: " + backgroundimage );
                    location.backgroundimage = backgroundimage;
                }
            }

            //

            var descindex = 0;
            var currentdescriptionsegment = "";
            var lastcharacter = '';

            if ( !bail )
            {
                while ( ch !== '~' && at < text.length && ch !== '#' && ch !== '^' && ch !== '/' && ch !== '>' && ch !== '`' && !( peeknextidentical( '|' ) && isconcept ) )
                {
                    /*if ( ch === '[' )
                    {
                        var overrideprocessingindex = 0;
                        var override = { title: '', target: '', conditional: '', hasconditional: false, exclusionconditional: false, token: '', action: '', displayaschild: false, linkdirection: 0 }

                        next();
                        if ( ch === "^" )
                        {
                            override.displayaschild = true;
                            next();
                        }
                        previous();

                        override.target += processconditional( ':', '@' );
                        override.title += processconditional( ']', '?', '!', '+', '@' );

                        //

                        if ( ch === '?' )
                        {
                            next();
                            override.combinationcondition = ( ch === '*' );

                            if ( !override.combinationcondition )
                            {
                                previous();
                            }

                            override.conditional += processconditional( ']', '+', '@' );
                            override.hasconditional = true;
                            override.conditional = override.conditional.trim();
                            //console.log( "inquisitorParse: Found Conditional: " + override.conditional );
                        }

                        if ( ch === '!' )
                        {
                            override.conditional += processconditional( ']', '+', '@' );
                            override.hasconditional = true;
                            override.exclusionconditional = true;
                            override.conditional = override.conditional.trim();
                            //console.log( "inquisitorParse: Found Exclusion Conditional: " + override.conditional );
                        }

                        //

                        if ( ch === '+' )
                        {
                            override.token += processconditional( ']', '-', '@' );
                            override.token = override.token.trim();
                            //console.log( "inquisitorParse: Found Token: " + override.token );
                        }

                        //

                        if ( ch === '-' )
                        {
                            override.action += processconditional( ']', '@' );
                            override.action = override.action.trim();
                            //console.log( "inquisitorParse: Found Action: " + override.action );
                        }

                        //

                        if ( ch === '@' )
                        {
                            var linkdirectionstring = '';
                            linkdirectionstring += processconditional( ']' );
                            override.linkdirection = directiontoint( linkdirectionstring.trim() );
                            //console.log( "inquisitorParse: Found Direction: " + override.linkdirection );
                        }

                        //

                        if ( override.title === '' )
                        {
                            override.title = override.target;
                        }

                        location.linkoverrides[override.target] = override;
                        //console.log( "inquisitorParse: Found location override. Title: " + override.title + ". Target: " + override.target );
                        next();
                    }*/

                    if ( peeknextidentical( '|' ) )
                    {
                        next();

                        //console.log( "inquisitorParse: Sceduling NPC conception." );

                        location.hasconcepts = true;

                        processlocation( true, location.staticname, location.id );
                        next(); next();

                        //console.log( "inquisitorParse: Ending NPC conception." );
                    }
                    else if ( ch === '"' )
                    {
                        console.log( "inquisitorParse: Reading quote as raw." );

                        //if ( !checkempty( currentdescriptionsegment.trim() ) )
                        //{
                        //previous();
                            //currentdescriptionsegment = grableadingwhitespace();
                            //var olddescriptionsegment = { text: currentdescriptionsegment, requiresactivation: false, postactivationtext: '', islink: false }
                            //location.descriptionsegments.push( olddescriptionsegment ); currentdescriptionsegment = '';
                        //}

                        //next();
                        next();

                        currentdescriptionsegment += '"' + ch + processconditional( '"' );

                        var olddescriptionsegment = { text: currentdescriptionsegment + '"', requiresactivation: false, active: true, postactivationtext: '', islink: false }
                        location.descriptionsegments.push( olddescriptionsegment ); currentdescriptionsegment = "";

                        console.log( "inquisitorParse: Ending quote." );

                        next();
                    }
                    else if ( ch === '{' || ch === '[' )
                    {
                        var islinklocal = ( ch === '[' );
                        var linkidentifier = !islinklocal ? '}' : ']';
                        var additionprocessingindex = 0;
                        var targetaddition = { target: '', title: '', transition: '', conditional: '', hasconditional: false, exclusionconditional: false, token: '', action: '', displayaschild: false, linkdirection: 0, resetonlink: false, force: ch === '{', allowmutual: !( ch === '{' ) }

                        next();
                        if ( ch === "^" )
                        {
                            targetaddition.displayaschild = true;
                            next();
                        }
                        previous();

                        var target = processconditional( ':', '@', '&' );
                        var multipletargets = false;

                        if ( ch === '&' )
                        {
                            var targets = [];
                            multipletargets = true;

                            targets.push( target );

                            while ( ch === '&' )
                            {
                                next();
                                targets.push( ch + processconditional( ':', '@', '&' ) );
                                //console.log( "inquisitorParse: Found location target number: " + targets.length + ". Title: " + targets[targets.length-1] );
                            }

                            target = targets[Math.floor( Math.random() * targets.length )];
                        }

                        targetaddition.target += target;//.trim();
                        targetaddition.title += processconditional( linkidentifier, '?', '+', '!', '@', '/', '<', '(' );//.trim();

                        if ( targetaddition.title === '' )
                        {
                            targetaddition.title = targetaddition.target;
                        }

                        //

                        if ( result.referencebuffer[targetaddition.target] === null || result.referencebuffer[targetaddition.target] === undefined )
                        {
                            result.referencebuffer[targetaddition.target] = [];
                        }
                        result.referencebuffer[targetaddition.target].push( { index: location.id, linktitle: location.name, allowmutual: targetaddition.allowmutual } );
                        //console.log( "inquisitorParse: Adding title to reference buffer: " + targetaddition.title + ". Reference count now: " + result.referencebuffer[targetaddition.title].length );

                        //

                        if ( ch === '?' )
                        {
                            next();
                            targetaddition.combinationcondition = (ch === '*');
                            previous();

                            targetaddition.conditional += processconditional( linkidentifier, '+', '@', '<' );
                            targetaddition.hasconditional = true;
                            targetaddition.conditional = targetaddition.conditional.trim();
                            //console.log( "inquisitorParse: Found Conditional: " + targetaddition.conditional );
                        }

                        if ( ch === '!' )
                        {
                            targetaddition.conditional += processconditional( linkidentifier, '+', '@', '<' );
                            targetaddition.hasconditional = true;
                            targetaddition.exclusionconditional = true;
                            targetaddition.conditional = targetaddition.conditional.trim();
                            //console.log( "inquisitorParse: Found Exclusion Conditional: " + targetaddition.conditional );
                        }

                        //

                        if ( ch === '+' )
                        {
                            targetaddition.token += processconditional( linkidentifier, '-', '@', '<' );
                            targetaddition.token = targetaddition.token.trim();
                            //console.log( "inquisitorParse: Found Token: " + targetaddition.token );
                        }

                        //

                        if ( ch === '-' )
                        {
                            targetaddition.action += processconditional( linkidentifier, '@', '<' );
                            targetaddition.action = targetaddition.action.trim();
                            //console.log( "inquisitorParse: Found Action: " + targetaddition.action );
                        }

                        if ( ch === '(' )
                        {
                            targetaddition.transition += processconditional( linkidentifier, ')' );
                            targetaddition.transition = targetaddition.transition.trim();
                            //console.log( "inquisitorParse: Found Transition: " + targetaddition.transition );
                            next();
                        }

                        //

                        if ( ch === '@' )
                        {
                            var linkdirectionstring = '';
                            linkdirectionstring += processconditional( linkidentifier, '<' );
                            targetaddition.linkdirection = inquisitor.directiontoint( linkdirectionstring.trim() );
                            //console.log( "inquisitorParse: Found Direction: " + targetaddition.linkdirection );
                        }

                        //

                        if ( ch === '<' )
                        {
                            targetaddition.resetonlink = true;
                            targetaddition.action = 'reset';
                            //console.log( "inquisitorParse: Reset on link" );
                            next();
                        }

                        location.linkadditions[targetaddition.target] = targetaddition;
                        //console.log( "inquisitorParse: Found target addition. Title: " + targetaddition.title + ". Target: " + targetaddition.target );
                        next();
                    }
                    else if ( ch === '|' )
                    {

                        //

                        if ( !checkempty( currentdescriptionsegment.trim() ) )
                        {
                            var olddescriptionsegment = { text: currentdescriptionsegment, requiresactivation: false, postactivationtext: '', islink: false }
                            location.descriptionsegments.push( olddescriptionsegment ); currentdescriptionsegment = '';
                        }

                        //console.log( "inquisitorParse: Found active note, processing." );

                        var newdescriptionsegment = { text: '', requiresactivation: true, active: false, postactivationtext: '', additional: false, givetoken: '', requiretokens: [], requireinversion: false, timedcondition: -1, timedconditionislocal: false, islink: false }
                        newdescriptionsegment.text += processconditional( ':' );

                        //console.log( "inquisitorParse: Found active note inactive text: " + newdescriptionsegment.text );

                        next();
                        newdescriptionsegment.additional = ( ch === '*' );

                        //console.log( "inquisitorParse: Is additional note: " + newdescriptionsegment.additional );

                        newdescriptionsegment.postactivationtext += processconditional( '|', '+', '?', '!', '(' );

                        if ( ch === '+' )
                        {
                            newdescriptionsegment.givetoken += processconditional( '|', '?', '!' );
                            newdescriptionsegment.givetoken = newdescriptionsegment.givetoken.trim();
                            //console.log( "inquisitorParse: Found Token to Give: " + newdescriptionsegment.givetoken );
                        }

                        if ( ch === '(' )
                        {
                            next();
                            var localtimecondition = ch === '^';
                            var timedcondition = parseInt( processconditional( ')', '+' ).trim() );
                            //console.log( "inquisitorParse: Found " + ( localtimecondition ? "Local" : "Global" ) + " Time Conditional: " + timedcondition );

                            newdescriptionsegment.timedcondition = timedcondition;
                            newdescriptionsegment.timedconditionislocal = localtimecondition;
                            next();
                        }

                        while ( true )
                        {
                            if ( ch === '?' || ch === '!' )
                            {
                                newdescriptionsegment.requireinversion = ( ch === '!' );
                                next();
                                var requiretoken = ch + processconditional( '|', '?', '!' );
                                requiretoken = requiretoken.trim();
                                newdescriptionsegment.requiretokens.push( requiretoken );
                                //console.log( "inquisitorParse: Found Token to Require: " + newdescriptionsegment.requiretokens[newdescriptionsegment.requiretokens.length - 1] );
                            }

                            if( ch === '|' )
                            {
                                break;
                            }
                            else if( ch !== '?' && ch !== '!' )
                            {
                                next();
                            }
                        }

                        //console.log( "inquisitorParse: Found active note active text: " + newdescriptionsegment.postactivationtext );

                        location.descriptionsegments.push( newdescriptionsegment );
                        next();
                    }
                    else if ( ch === '@' )
                    {
                        var titletext = processconditional( '\n', '$' ).substring( 1 );
                        next();
                        currentdescriptionsegment += titletext;
                    }
                    else if ( ch === '&' && location.isobject )
                    {
                        var descriptioninparent = processconditional( '\n', '$' );
                        next();
                        location.descriptioninparent += '\n' + '\n' + descriptioninparent;
                    }
                    else if ( ch === '$' )
                    {
                        var achievementstring = processconditional( '\n' ).trim();
                        next();
                        location.achievementname = achievementstring;
                    }
                    else if ( ch === '<' )
                    {
                        //if ( !checkempty( currentdescriptionsegment.trim() ) )
                        //{
                            //currentdescriptionsegment += grableadingwhitespace();
                            var olddescriptionsegment = { text: currentdescriptionsegment, requiresactivation: false, active: true, postactivationtext: '', islink: false }
                            location.descriptionsegments.push( olddescriptionsegment ); currentdescriptionsegment = '';
                        //}

                        //

                        var inlinelink = {};
                        //inlinelink.text  = grableadingwhitespace();
                        inlinelink.text = processconditional( '|' );
                        next();
                        inlinelink.destination = ch + processconditional( '>' );
                        inlinelink.segmentindex = location.descriptionsegments.length;
                        location.inlinelinks.push( inlinelink );

                        next();

                        var newdescriptionsegment = { text: inlinelink.text.trimRight(), requiresactivation: false, active: true, postactivationtext: '', islink: true }
                        location.descriptionsegments.push( newdescriptionsegment );
                    }
                    else
                    {
                        //

                        previous();
                        if ( ch === '\n' )
                        {
                            if ( !checkempty( currentdescriptionsegment.trim() ) )
                            {
                                var isabreak = ( currentdescriptionsegment.trim() === '-' );

                                var olddescriptionsegment = { text: currentdescriptionsegment.trimRight(), requiresactivation: false, active: true, postactivationtext: '', islink: false, isbreak: isabreak }
                                location.descriptionsegments.push( olddescriptionsegment ); currentdescriptionsegment = '';
                            }
                        }
                        next();

                        if ( descindex > 0 )
                        {
                            currentdescriptionsegment += ch;
                        }
                        next();
                        descindex++;
                    }
                }
            }

            //

            if ( !checkempty( currentdescriptionsegment.trim() ) )
            {
                var olddescriptionsegment = { text: currentdescriptionsegment, requiresactivation: false, active: true, postactivationtext: '' }
                location.descriptionsegments.push( olddescriptionsegment ); currentdescriptionsegment = '';
                //console.log( "inquisitorParse: Found location description.");
            }

            //

            for ( var inlineindex in location.inlinelinks )
            {
                var foundreference = false;
                var segindex = location.inlinelinks[inlineindex].segmentindex;
                var descriptionsegmenttoupdate = location.descriptionsegments[segindex];

                //console.log( "inquisitorParse: Connecting inline and offline link to destination: " + location.inlinelinks[inlineindex].destination );

                for ( var overrideindex in location.linkoverrides )
                {
                    if( location.linkoverrides[overrideindex].target === location.inlinelinks[inlineindex].destination )
                    {
                        //console.log( "inquisitorParse: Connected inline and offline link." );
                        descriptionsegmenttoupdate.referencedlink = overrideindex;
                        descriptionsegmenttoupdate.referencedlinkisadditional = false;

                        foundreference = true;
                    }
                }

                if( !foundreference )
                {
                    for ( var overrideindex in location.linkadditions )
                    {
                        if ( location.linkadditions[overrideindex].target === location.inlinelinks[inlineindex].destination )
                        {
                            //console.log( "inquisitorParse: Connected inline and offline link. (Additional)" );
                            descriptionsegmenttoupdate.referencedlink = overrideindex;
                            descriptionsegmenttoupdate.referencedlinkisadditional = true;

                            foundreference = true;
                        }
                    }
                }

                if( !foundreference )
                {
                    var targetaddition = { target: location.inlinelinks[inlineindex].destination, title: location.inlinelinks[inlineindex].destination, conditional: '', hasconditional: false, exclusionconditional: false, token: '', action: '', displayaschild: false, linkdirection: 0, resetonlink: false, inlinelinkreference: true, allowmutual: false }

                    descriptionsegmenttoupdate.referencedlink = location.inlinelinks[inlineindex].destination;
                    descriptionsegmenttoupdate.referencedlinkisadditional = true;

                    if ( result.referencebuffer[targetaddition.target] === null || result.referencebuffer[targetaddition.target] === undefined )
                    {
                        result.referencebuffer[targetaddition.target] = [];
                    }
                    result.referencebuffer[targetaddition.target].push( { index: location.id, linktitle: targetaddition.title } );

                    location.linkadditions[location.inlinelinks[inlineindex].destination] = targetaddition;
                }
            }

            //

            location.parentid = inquisitor.findparent( result, location ).id;

            if ( location.isentity )
            {
                result.entitydefinitionbuffer.push( location );
            }
            else if ( location.isconcept )
            {
                location.conceptparentid = conceptparentid;
                result.conceptdefinitionbuffer.push( location );
            }
            else
            {
                result.rawlocations.push( location );
            }

            return location;
        }

        error( "Bad Location" );
    };

    var event = function ()
    {
        var key,
            event = {};
        event.text = "";
        event.id = result.rawevents.length;
        event.locationid = result.rawlocations.length;
        event.condition = '';
        event.descriptionsegments = [];
        event.timedcondition = -1;
        event.timedconditionislocal = false;
        event.givetoken = '';
        event.soundurl = '';
        event.achievementname = '';
        event.istimelineevent = ( ch === '`' );

        //console.log( "inquisitorParse: Processing Event: " + event.id + " in location: " + event.locationid );

        if ( ch === '#' || ch === '`' )
        {
            if ( event.istimelineevent )
            {
                event.timeline = {};
                event.timeline.title = processconditional( '|' );
                next();
                event.timeline.displaydate    = ch + processconditional( '|' );
                next();
                event.timeline.fulldate = {};
                event.timeline.fulldate.day   = ch + processconditional( '/' ),
                                next();
                event.timeline.fulldate.month = ch + processconditional( '/' ),
                                next();
                event.timeline.fulldate.year = ch + processconditional( '\n', '|' ).trim();

                event.timeline.backgroundurl = '';
                if ( ch === '|' )
                {
                    next();
                    event.timeline.backgroundurl = ch + processconditional( '\n' ).trim();
                }

                next();

                //console.log( "inquisitorParse: Found timeline event. Title: " + event.timeline.title + " Display Date: " + event.timeline.displaydate + " Background URL: " + event.timeline.backgroundurl + " Full Date: " );
                //console.log( event.timeline.fulldate );
            }

            if ( ch === '(' )
            {
                next();
                var localtimecondition = ch === '^';
                var timedcondition = parseInt( processconditional( ')', '+' ).trim() );
                //console.log( "inquisitorParse: Found " + ( localtimecondition ? "Local" : "Global" ) + " Time Conditional: " + timedcondition );

                event.timedcondition = timedcondition;
                event.timedconditionislocal = localtimecondition;
                next();
            }

            if ( ch === '[' )
            {
                var condition = processconditional( ']', '+' ).trim();
                //console.log( "inquisitorParse: Found Event Conditional: " + condition );

                if ( ch === '+' )
                {
                    event.givetoken += processconditional( ']' );
                    event.givetoken = event.givetoken.trim();
                    //console.log( "inquisitorParse: Found Token: " + event.givetoken );
                }

                event.condition = condition;
                next();
            }

            while ( ch !== '#' && ch !== '[' && ch !== '`' && ch !== '/' && at < text.length )
            {
                if ( ch === '@' )
                {
                    var quotetitle = processconditional( '\n' );
                    next();
                    event.text += "@@" + quotetitle + "";
                    //console.log( "inquisitorParse: Found event sound: " + event.soundurl );
                }
                else if ( ch === '&' )
                {
                    var soundurl = processconditional( '\n', '$' );
                    next();
                    event.soundurl += soundurl;
                    //console.log( "inquisitorParse: Found event sound: " + event.soundurl );
                }
                else if ( ch === '$' )
                {
                    var achievementstring = processconditional( '\n' ).trim();
                    next();
                    event.achievementname = achievementstring;
                }
                else if ( ch === '"' )
                {
                    console.log( "inquisitorParse: Reading quote as raw." );

                    next();

                    var currentdescriptionsegment = ch + processconditional( '"' );

                    event.text += '"' + currentdescriptionsegment + '"';

                    console.log( "inquisitorParse: Ending quote." );

                    next();
                }
                else
                {
                    event.text += ch;
                    next();
                }
            }

            if ( !checkempty( event.text.trim() ) )
            {
                var olddescriptionsegment = { text: event.text, requiresactivation: false, active: true, postactivationtext: '' }
                event.descriptionsegments.push( olddescriptionsegment );
                //console.log( "inquisitorParse: Found event description." );
            }

            //console.log( "inquisitorParse: Found event text: " + event.text );

            result.rawevents.push( event );
            return event;
        }

        error( "Bad Event" );
    };

    var dialogue = function ()
    {
        var dialogue = {};
        dialogue.rawtext = "";
        dialogue.id = result.rawdialogue.length;
        dialogue.locationid = result.rawlocations.length;
        dialogue.readprogress = 1;
        dialogue.givetoken = '';
        dialogue.soundurl = '';
        dialogue.achievementname = '';
        dialogue.requiretokens = [];
        dialogue.requiresactivation = false;
        dialogue.descriptionsegments = [];

        next();

        var currentdescriptionsegment = "";
        while ( ch !== ':' )
        {
            currentdescriptionsegment += ch;
            dialogue.rawtext += ch;

            if ( ch === '\n' && !checkempty( currentdescriptionsegment.trim() ) )
            {
                var olddescriptionsegment = { text: currentdescriptionsegment.trim(), requiresactivation: false, active: true, postactivationtext: '', islink: false }
                dialogue.descriptionsegments.push( olddescriptionsegment ); currentdescriptionsegment = '';
            }

            next();
        }

        if ( !checkempty( currentdescriptionsegment.trim() ) )
        {
            var olddescriptionsegment = { text: currentdescriptionsegment.trim(), requiresactivation: false, active: true, postactivationtext: '', islink: false }
            dialogue.descriptionsegments.push( olddescriptionsegment ); currentdescriptionsegment = '';
        }

        next();

        if ( ch === '&' )
        {
            var soundurl = processconditional( '\n' );
            next();
            dialogue.soundurl += soundurl;
            //console.log( "inquisitorParse: Found dialogue sound: " + dialogue.soundurl );
        }

        if ( ch === '+' )
        {
            dialogue.givetoken += processconditional( '/', '?', '!' );
            dialogue.givetoken = dialogue.givetoken.trim();
            //console.log( "inquisitorParse: Found Token to Give: " + dialogue.givetoken );
        }

        while ( true )
        {
            if ( ch === '?' || ch === '!' )
            {
                dialogue.requireinversion = ( ch === '!' );
                next();
                var requiretoken = ch + processconditional( '/', '?', '!', '$' );
                requiretoken = requiretoken.trim();
                dialogue.requiretokens.push( requiretoken );
                dialogue.requiresactivation = true;
                //console.log( "inquisitorParse: Found Token to Require: " + dialogue.requiretokens[dialogue.requiretokens.length - 1] );
            }

            if ( ch === '$' )
            {
                var achievementstring = processconditional( '/' ).trim();
                dialogue.achievementname = achievementstring;
            }

            if ( ch === '/' )
            {
                break;
            }
            else
            {
                next();
            }
        }

        //dialogue.text = dialogue.rawtext.split( '\n');

        //console.log( "inquisitorParse: Found dialogue text: " + dialogue.rawtext );
        result.rawdialogue.push( dialogue );

        next();

        return dialogue;
    };

    var comment = function()
    {
        var commenttext = "";
        var isterminated = false;

        next();

        while ( !isterminated )
        {
            commenttext += processconditional( '/' );
            isterminated = peeknextidentical( '/' );
            next();
        }

        next();

        return commenttext;
    }

    var agent = function()
    {
        var agentraw = "";
        var isterminated = false;

        next();

        while ( !peeknextidentical( '^' ) )
        {
            agentraw += ch;
            next();
        }

        next();
        next();

        //inquisitor.createagent( agentraw );

        var newagent = new inquisitoragent();
        newagent.phraseraw( agentraw, Object.keys(result.agents).length );

        result.agents[newagent.name] = newagent;

        return agentraw;
    }

    var includebuffer = [];
    var includebufferprogress = 0;

    var include = function ()
    {
        var includeurl = "";

        next();
        next();

        includeurl += ch + processconditional( "'", '"' ).trim();
        includebuffer.push( includeurl );

        return includeurl;
    }

    var value = function ()
    {
        //console.log( "inquisitorParse: Finding object to process" );

        switch ( ch )
        {
            case '/':
                {
                    if ( peeknextidentical( '/' ) )
                    {
                        return comment();
                    }
                    else
                    {
                        return dialogue();
                    }
                }
            case '~':
                return processlocation();
            case '^':
                {
                    if ( peeknextidentical( '^' ) )
                    {
                        next();
                        return agent();
                    }
                    else
                    {
                        return processlocation();
                    }
                }
            case ':':
                return processlocation();
            case '#':
                return event();
            case '`':
                return event();
            case '>':
                {
                    if ( peeknextidentical( '>' ) )
                    {
                        next();
                        return include();
                    }
                    else
                    {
                        next();
                        return '';
                    }
                }
            default:
                next();
                return '';
        }
    };

    //console.log( "inquisitorParse: Began parser." );

    //

    function beginread( url, callback )
    {
        at = 0;
        next();
        //console.log( "inquisitorParse: Loaded source. Length: " + text.length + " characters." );

        //

        while ( at < text.length )
        {
            value();
        }

        if ( includebufferprogress < includebuffer.length )
        {
            beginprocess( includebuffer[includebufferprogress], callback );
            includebufferprogress++;
        }
        else
        {
            //

            for ( var index in result.entitydefinitionbuffer )
            {
                var entity = result.entitydefinitionbuffer[index];
                entity.id = result.rawlocations.length;
                result.entities.push( entity.id );
                result.rawlocations.push( entity );
            }

            for ( var index in result.conceptdefinitionbuffer )
            {
                var concept = result.conceptdefinitionbuffer[index];
                concept.id = result.rawlocations.length;
                result.rawlocations[concept.conceptparentid].conceptids.push( concept.id );
                result.rawlocations.push( concept );

                //console.log( result.rawlocations[concept.conceptparentid].conceptids );
            }

            //

            callback( result );
        }
    }

    var beginprocess = function ( url, callback )
    {
        var client = new XMLHttpRequest();
        client.open( 'GET', url );

        client.onreadystatechange = function ()
        {
            if ( this.readyState == this.DONE )
            {
                text = client.responseText;
                result.scriptlocations.push( url );

                /*const fs = require( 'fs' );
                fs.watchFile( url, function ()
                {
                    resetworld();
                } );*/

                beginread( url, callback );
            }
        }

        client.send();
    }

    beginprocess( inputsource, maincallback );
}
