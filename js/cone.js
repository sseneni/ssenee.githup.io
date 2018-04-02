// -------------------------- Cone -------------------------- //

var Cone = Group.subclass({
  radius: 0.5,
  height: 1,
  color: '#333',
  baseColor: undefined,
  fill: true,
  stroke: true,
  lineWidth: 1,
  updateSort: true,
});

Cone.prototype.create = function( options ) {
  // call super
  Group.prototype.create.apply( this, arguments );
  // composite shape, create child shapes
  this.apex = new Shape({
    rendering: false,
    translate: { z: -this.height },
    addTo: this,
  });
  // outside base
  var base = new Ellipse({
    width: this.radius * 2,
    height: this.radius * 2,
    addTo: this,
    color: this.color,
    lineWidth: this.lineWidth,
    stroke: this.stroke,
    fill: this.fill,
    backfaceHidden: this.baseColor ? true : false,
  });
  // inside base
  if ( this.baseColor ) {
    base.copy({
      color: this.baseColor,
      rotate: { y: TAU/2 },
    });
  }

  // used for calculating contour angle
  this.renderNormal = base.renderNormal;
  // vectors used for calculation
  this.renderApex = new Vector3();
  this.tangentA = new Vector3();
  this.tangentB = new Vector3();
};

Cone.prototype.render = function( ctx ) {
  this.renderCone( ctx );
  Group.prototype.render.call( this, ctx );
};

Cone.prototype.renderCone = function( ctx ) {
  this.renderApex.set( this.apex.renderOrigin )
    .subtract( this.renderOrigin );
  var apexDistance = getDistance1( this.renderApex.x, this.renderApex.y );
  // TODO fix for scale
  var normalDistance = getDistance1( this.renderNormal.x, this.renderNormal.y );
  // eccentricity
  var eccenAngle = Math.acos( normalDistance );
  var eccen = Math.sin( eccenAngle );
  // does apex extend beyond eclipse of face
  var isApexVisible = this.radius * eccen < apexDistance;
  if ( !isApexVisible ) {
    return;
  }

  var apexAngle = Math.atan2( this.renderNormal.y, this.renderNormal.x ) + TAU/2;
  var projectLength = apexDistance / eccen;
  var projectAngle = Math.acos( this.radius / projectLength );
  // set tangent points
  var tangentA = this.tangentA;
  var tangentB = this.tangentB;

  tangentA.x = Math.cos( projectAngle ) * this.radius * eccen;
  tangentA.y = Math.sin( projectAngle ) * this.radius;

  tangentB.set( this.tangentA );
  tangentB.y *= -1;

  tangentA.rotateZ( apexAngle );
  tangentB.rotateZ( apexAngle );
  tangentA.add( this.renderOrigin );
  tangentB.add( this.renderOrigin );

  ctx.strokeStyle = ctx.fillStyle = this.color;
  ctx.beginPath();
  ctx.moveTo( tangentA.x, tangentA.y );
  ctx.lineTo( this.apex.renderOrigin.x, this.apex.renderOrigin.y );
  ctx.lineTo( tangentB.x, tangentB.y );

  if ( this.stroke ) {
    ctx.stroke();
  }
  if ( this.fill ) {
    ctx.fill();
  }
};
