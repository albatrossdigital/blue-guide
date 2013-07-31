query = undefined
tab = undefined
rev = 0.1
activeTab = undefined
window.onload = ->

  # Add responsive media queries
  queries = [
    context: "mobile"
    match: ->
      window.responsive = "mobile"
  ,
    context: "desktop"
    match: ->
      window.responsive = "desktop"
  ]
  MQ.init queries

  # Add filters
  filters = new Filters()
  data = locache.get("blueGuideData")
  filters.draw "#filters", "#showFilters"

  # Get data if we need to
  if data and data.rev and data.rev is rev
    query = new JsonQuery("body", data)
  else
    `googleQuery = new GoogleSpreadsheetsQuery(filters, function(data) {
      locache.set("blueGuideData", data);
      query = new JsonQuery("body", data);
    });`
    googleQuery.get "select *"

  params = 
    id: "map"
    updateSelector: "body"
    draw: true
    resultsSelector: "#results"
    showPopup: window.responsive isnt "mobile"
    startLat: 38.659777730712534
    startLng: -105.8203125
    locate: {html: ich.locateBtn()}   
    layerUrl: "http://a.tiles.mapbox.com/v3/albatrossdigital.map-idkom5ru/{z}/{x}/{y}.png"
    fields: filters.displayFields
    tabs: filters.tabs
  if window.responsive isnt "mobile" or 1 is 1
    params.geosearch =
      provider: "Google"
      settings:
        zoomLevel: 13 

  # Add map
  map = new Map params

  # Add binds
  $("body").bind "queryUpdate", ->
    updateMarkers()
    $("body").addClass "left-sidebar-active"

  map.map.on "geosearch_showlocation", (e) ->
    locationUpdated(new L.LatLng(e.Location.Y, e.Location.X))

  map.map.on "locationfound", (e) ->
    locationUpdated(e.latlng)

  map.map.on "dragend", ->
    if !map.lastBounds? or !query.withinBounds(map.map.getCenter(), map.markerBounds map.lastBounds, 1.5)
      updateMarkers()

  map.map.on "zoomend", ->
    updateMarkers()


  #$('.left-sidebar').bind "click", ->
  #  $('body').addClass "left-sidebar-big"
  #  resizeMap()

  # Called when markers are updated
  updateMarkers = ->
    $('#show-markers').addClass "icon-spin"
    map.drawMarkers query.active(map.markerBounds(map.map.getBounds()))
    $('#show-markers').addClass "icon-spin"
    $("#tabs a:eq(0)").addClass("active") if !activeTab?
    console.log "update"

  locationUpdated = (latlng) ->
    map.addMarker(latlng)
    map.updateLocation latlng
    query.fillActive()
    updateMarkers()
    $("body").addClass "left-sidebar-active"
    resizeMap()
    
  resizeMap = ->
    window.setTimeout ->
      map.map.invalidateSize animate: true
    , 500

  return

