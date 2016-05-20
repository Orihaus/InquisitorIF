var Sigil = function ()
{
    Sigil.prototype.initialize = function ( element )
    {
        this.element = element;

        this.mousex = -1;
        this.mousey = -1;
        this.processingclick = false;

        this.circlesigils = [];

        this.canvas = $( "#demoCanvas" ).get( 0 );
        this.stage = new createjs.Stage( "demoCanvas" );
        this.stage.enableMouseOver();
        this.stage.alpha = 0.95;
        //this.stage.autoClear = false;

        this.context = this.canvas.getContext( '2d' );
        /* this.canvas.addEventListener( "click", function ( event )
         {
             console.log( 'Clicked' );
 
             var canvasOffset = $( "#demoCanvas" ).offset();
             var offsetX = canvasOffset.left;
             var offsetY = canvasOffset.top;
 
             this.mousex = parseInt( event.clientX - offsetX );
             this.mousey = parseInt( event.clientY - offsetY );
             this.processingclick = true;
             //this.draw();
             this.processingclick = false;
             //this.draw();
         }, false );
 
         this.canvas.addEventListener( "mousemove", function ( event )
         {
             console.log( 'Clicked' );
 
             var canvasOffset = $( "#demoCanvas" ).offset();
             var offsetX = canvasOffset.left;
             var offsetY = canvasOffset.top;
 
             this.mousex = parseInt( event.clientX - offsetX );
             this.mousey = parseInt( event.clientY - offsetY );
             //this.draw();
         }, false );*/
    }

    Sigil.prototype.drawsegment = function ( path, x, y, radius, circle, itteration, sigil, startangle, endangle )
    {
        if ( this.circlesigils[sigil].circles[circle][itteration] )
        {
            this.stage.setChildIndex( path, this.stage.getNumChildren() - 1 );
        }
        else
        {
            this.stage.setChildIndex( path, 0 );
        }

        var brightness = ( this.circlesigils[sigil].circles[circle][itteration] ? 200 : 24 );
        brightness += ( this.circlesigils[sigil].circleshover[circle][itteration] ? 55 : 0 );
        var brightnessrgba = 'rgba(' + brightness + ',' + brightness + ',' + brightness + ', 1.0 )';
        path.graphics.setStrokeStyle( 5, 'butt' ).beginStroke( brightnessrgba ).arc( x, y, radius, startangle, endangle, false );
    }

    function processsegmentclick( event, data )
    {
        console.log( 'Clicked on path, ' + data.circle + ' ' + data.itteration );

        if ( data.isclick )
        {
            data.This.circlesigils[data.sigil].circles[data.circle][data.itteration] = !data.This.circlesigils[data.sigil].circles[data.circle][data.itteration];
        }
        else
        {
            data.This.circlesigils[data.sigil].circleshover[data.circle][data.itteration] = data.isover;
        }

        data.path.graphics.clear();
        data.This.drawsegment( data.path, data.x, data.y, data.radius, data.circle, data.itteration, data.sigil, data.startangle, data.endangle );
        data.This.stage.update();
    }

    const fourthpi = Math.PI / 1.5;
    const tenthpi = 0.4;
    Sigil.prototype.drawsegmentedcircle = function ( x, y, radius, circle, sigil )
    {
        var arcprogress = fourthpi / 4;

        for ( var itteration = 0; itteration < 3; itteration++ )
        {
            var startangle = arcprogress, endangle = arcprogress + fourthpi;
            arcprogress += fourthpi;

            var path = new createjs.Shape();
            this.drawsegment( path, x, y, radius, circle, itteration, sigil, startangle, endangle );

            path.on( "click", processsegmentclick, null, false, { This: this, isclick: true, path: path, x: x, y: y, radius: radius, circle: circle, itteration: itteration, sigil: sigil, startangle: startangle, endangle: endangle } );
            path.on( "mouseover", processsegmentclick, null, false, { This: this, isclick: false, isover: true, path: path, x: x, y: y, radius: radius, circle: circle, itteration: itteration, sigil: sigil, startangle: startangle, endangle: endangle } );
            path.on( "mouseout", processsegmentclick, null, false, { This: this, isclick: false, isover: false, path: path, x: x, y: y, radius: radius, circle: circle, itteration: itteration, sigil: sigil, startangle: startangle, endangle: endangle } );

            this.stage.addChild( path );
            this.stage.update();
        }
    }

    Sigil.prototype.newcircle = function ()
    {
        var circle = [];
        for ( var subcircle = 0; subcircle < 3; subcircle++ )
        {
            circle.push( false );
        }
        return circle;
    }

    Sigil.prototype.drawthiscircle = function ( x, y )
    {
        var circles = [];
        for ( var circle = 0; circle < 4; circle++ )
        {
            circles.push( this.newcircle() );
        }

        var circleshover = [];
        for ( var circle = 0; circle < 4; circle++ )
        {
            circleshover.push( this.newcircle() );
        }

        this.circlesigils.push( { circles: circles, circleshover: circleshover } );

        this.drawsegmentedcircle( x, y - 35, 35, 0, this.circlesigils.length - 1 );
        this.drawsegmentedcircle( x + 29, y + 15, 35, 1, this.circlesigils.length - 1 );
        this.drawsegmentedcircle( x - 29, y + 15, 35, 2, this.circlesigils.length - 1 );
        this.drawsegmentedcircle( x, y, 70, 3, this.circlesigils.length - 1 );
    }

    Sigil.prototype.draw = function ()
    {
        this.drawthiscircle( 160, 80 );
        this.drawthiscircle( 90, 205 );
        this.drawthiscircle( 230, 205 );

        var circles = [], circleshover = []; circles.push( this.newcircle() ); circleshover.push( this.newcircle() );
        this.circlesigils.push( { circles: circles, circleshover: circleshover } );
        this.drawsegmentedcircle( 160, 160, 150, 0, this.circlesigils.length - 1 );
        console.log( 'Drawn' );
    }
};
var sigil = new Sigil();