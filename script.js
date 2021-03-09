function onEachFeature(feature, layer) {
  if (feature.properties) {
    layer.bindPopup(feature.properties.NHD_NAME);
  }
}

var population = $.ajax({
    url: "https://raw.githubusercontent.com/jca26c/STL_population/main/STL_population.geojson",
    dataType: "json"  
})

var neighborhood = $.ajax({
    url: "https://raw.githubusercontent.com/jca26c/STL_neighborhoods/main/stl_neighborhoods",
    dataType: "json"  
})

var roads = $.ajax({
    url: "https://raw.githubusercontent.com/jca26c/STL_highways/main/road_geojson",
    dataType: "json"  
})

$.when(population).done(function() {
   var map = L.map('map',{
         center: [38.6,-90.1],
          zoom: 10,
});
    var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
  
    // Add requested external GeoJSON to map
    function getColor(d) {
        return d > 7000 ? '#0F4402 ' :
               d > 6000  ? '#1D8104 ' :
               d > 5000  ? '#209B02 ' :
               d > 4000  ? '#28BD03 ' :
               d > 3000   ? '#8BD388 ' :
               d > 2000   ? '#8C900B ' :
               d > 1000   ? '#DFE514 ' :
                          '#E9EBAD ';
    }
      function style(feature) {
        return {
            fillColor: getColor(feature.properties.POP00),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    var pop_display = L.geoJson(population.responseJSON,
                               {onEachFeature: onEachFeature,style: style}).addTo(map);
    var legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000],
        labels = [];
       div.innerHTML += '<b>Population 2000</b><br>'  // don't forget the break tag
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(map);
    var neighborhood_display = L.geoJSON(neighborhood.responseJSON,{
      onEachFeature: onEachFeature,
      color: "#000000", weight: 2,"fillOpacity": .0}).addTo(map);
  
  var roads_display = L.geoJSON(roads.responseJSON,{onEachFeature: onEachFeature,
                                                    color: "#FF0000 ", weight: 3}).addTo(map);
    $.getJSON("https://raw.githubusercontent.com/jca26c/STL_starbucks_location/main/starbucks_locations.geojson",function(data){
    var coffee_icon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/jca26c/icons/main/%E2%80%94Pngtree%E2%80%94vector%20coffee%20icon_4002238.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    });
     
    var coffee = L.geoJson(data,{
      pointToLayer: function(feature,latlng){
        var marker = L.marker(latlng,{icon: coffee_icon});
        marker.bindPopup(feature.properties.Address + '<br/>' + feature.properties.NHD_NAME);
        return marker;
      }
    });
    var coffee_cluster = L.markerClusterGroup();
    coffee_cluster.addLayer(coffee);
    map.addLayer(coffee_cluster);
  });
  var watercolor = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
})
var toner = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
})
var terrain = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
})

var cola = L.tileLayer('http://a.sm.mapstack.stamen.com/(watercolor,$eb0000[hsl-color])[soft-light]/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
})
var baseMaps = {
    "Watercolor": watercolor ,
    "Toner": toner,
    "Terrain": terrain,
    "Cola": cola,
  "Home": basemap
};
  
  var overlayMaps = {
    "Population": pop_display,
    "Neighborhood": neighborhood_display,
    "Roads": roads_display
    };
  L.control.layers(baseMaps, overlayMaps).addTo(map);
  L.control.scale().addTo(map);
   var searchControl = new L.esri.Controls.Geosearch().addTo(map);
   var results = new L.LayerGroup().addTo(map);

  searchControl.on('results', function(data){
    results.clearLayers();
    for (var i = data.results.length - 1; i >= 0; i--) {
      results.addLayer(L.marker(data.results[i].latlng));
    }
  });
setTimeout(function(){$('.pointer').fadeOut('slow');},3400); 
});
