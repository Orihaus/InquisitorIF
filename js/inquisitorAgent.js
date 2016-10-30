function inquisitoragent()
{
};

inquisitoragent.prototype.rawnext = function()
{
  this.rawread = this.raw.charAt( this.rawreadprogress );
  this.rawreadprogress++;
}

inquisitoragent.prototype.rawprevious= function()
{
  this.rawreadprogress--;
  this.rawreadprogress--;
  this.rawread = this.raw.charAt( this.rawreadprogress );
}

inquisitoragent.prototype.conditionalread = function( condition )
{
  var processingindex = 0;
  var processresult = '';

  while ( this.rawread !== '\n' && this.rawread !== condition && this.rawreadprogress < this.raw.length - 1 )
  {
      processresult += this.rawread;
      this.rawnext();
      processingindex++;
  }

  this.rawnext();

  return processresult;
}

inquisitoragent.prototype.phraseraw = function( raw, index )
{
  this.rawreadprogress = 0;
  this.raw = raw;
  this.id = index;
  this.states = {};
  this.values = {};
  this.rawread = "";

  this.values.conviction = 5;

  console.log( "inquisitoragent: Phrasing Agent: " + index );

  this.name = this.conditionalread( '\n' );

  while ( this.rawreadprogress < this.raw.length - 1 )
  {
    if( this.rawread === '=' )
    {
      this.rawnext();
      var valuename = this.conditionalread( ':' );
      var value = this.conditionalread( '\n' );
    }

    if( this.rawread === '>' )
    {
      console.log( "inquisitoragent: Found state chain." );

      var statedepth = 0;
      var laststate;
      while ( this.rawread === '>' )
      {
        this.rawnext();

        var state = this.conditionalread( ':' );
        var weight = this.conditionalread( '>' );
        this.rawprevious();

        console.log( "inquisitoragent: Found state name: " + state + " with weight: " + weight );

        if( this.states[state] === null || this.states[state] === undefined )
        {
          this.states[state] = {};
          this.states[state].connections = {};
        }

        if( statedepth > 0 )
        {
          this.states[laststate].connections[state] = weight;
        }
        statedepth++;
        laststate = state;

        this.rawnext();
      }

      console.log( "inquisitoragent: Exiting state chain." );
    }

    this.values[valuename] = value;
    this.rawnext();
  }

  console.log( this );
}
